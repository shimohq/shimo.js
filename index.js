'use strict';

var request = require('request');
var Promise = require('bluebird');
var createError = require('http-errors');
var _ = require('lodash');
var urlLib = require('url');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var qs = require('qs');

function Shimo(options) {
  if (!options.version) {
    throw new Error('version is required');
  }

  this.options = _.defaultsDeep(options || {}, {
    protocol: 'https',
    host: 'api.shimo.im',
    requestOpts: { json: true }
  });
  this.options.base = this.options.protocol + '://' + this.options.host;

  if (this.options.bluebird) {
    Promise.config(this.options.bluebird);
  }

  EventEmitter.call(this);
}
inherits(Shimo, EventEmitter);

Shimo.prototype._request = function (options) {
  var query = _.pick(options, ['method', 'qs', 'body', 'json', 'headers']);
  query.url = this.options.base + (options.path[0] === '/' ? options.path : '/' + options.path);
  var authHeader = { Accept: 'application/vnd.shimo.' + this.options.version + '+json' };
  query.headers = query.headers ? _.assign(authHeader, query.headers) : authHeader;
  if (this.options.accessToken) {
    query.headers.Authorization = 'Bearer ' + this.options.accessToken;
  }

  var _this = this;
  return apiRequest(query, options.rawResponse, this.options.nats).catch(function (err) {
    if (err.status !== 401 || options.retried || !_this.options.refreshToken) {
      throw err;
    }
    return _this.token('refresh_token', {
      refresh_token: _this.options.refreshToken
    }).then(function (res) {
      _this.emit('accesstoken_change', res.access_token);
      _this.options.accessToken = res.access_token;
      _this.emit('refreshtoken_change', res.refresh_token);
      _this.options.refreshToken = res.refresh_token;
      return _this.request(_.assign({}, options, { retried: true }));
    });
  });
};

var methods = ['head', 'get', 'post', 'put', 'delete', 'patch'];

methods.forEach(function (method) {
  Shimo.prototype[method] = function (path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    options = _.defaultsDeep({}, options, this.options.requestOpts);
    options.method = method;
    options.path = path;
    return this._request(options).asCallback(callback);
  };
});

Shimo.prototype.token = function (grantType, options, callback) {
  return this.post('oauth/token', {
    json: false,
    body: _.assign(options, { grant_type: grantType })
  }, callback);
};

Shimo.prototype.authorization = function (options, callback) {
  return urlLib.format({
    protocol: this.options.protocol,
    pathname: 'oauth/authorization',
    host: this.options.host,
    query: _.assign(options, {
      client_id: this.options.clientId,
      response_type: 'code'
    })
  });
};

function apiRequest(query, rawResponse, nats) {
  if (nats) {
    return new Promise(function (resolve, reject) {
      query.method = query.method.toUpperCase();
      if (query.qs) {
        var parsedUrl = urlLib.parse(query.url);
        var parsedQS;
        if (parsedUrl.search) {
          parsedQS = Object.assign(qs.parse(parsedUrl.search.slice(1)), query.qs);
        } else {
          parsedQS = query.qs;
        }
        delete query.qs;
        parsedUrl.search = '?' + qs.stringify(parsedQS);
        query.url = urlLib.format(parsedUrl);
      }
      query.headers = Object.keys(query.headers).reduce(function (headers, key) {
        headers[key.toLowerCase()] = query.headers[key];
        return headers;
      }, {});
      delete query.json;
      nats.request('api.http', JSON.stringify(query), { max: 1 }, function (res) {
        console.log('==gotres', res);
        resolve(res);
      });
    });
  }
  return new Promise(function (resolve, reject) {
    request(query, function (error, response, body) {
      if (error) {
        reject(error);
        return;
      }
      var code = response.statusCode;
      if (code.toString()[0] !== '2') {
        if (body && body.error) {
          reject(createError(code, body.error, { errorCode: body.errorCode }));
        } else {
          reject(createError(code));
        }
        return;
      }
      if (rawResponse) {
        resolve(response);
      } else {
        resolve(body);
      }
    });
  });
}

module.exports = Shimo;
