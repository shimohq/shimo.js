'use strict';

var request = require('request');
var Promise = require('bluebird');
var createError = require('http-errors');
var _ = require('lodash');

function Shimo(options) {
  this.options = _.defaults(options || {}, {
    protocol: 'https',
    host: 'api.shimo.im'
  });

  this.options.json = true;
}

var methods = ['head', 'get', 'post', 'put', 'delete', 'patch'];

methods.forEach(function (method) {
  Shimo.prototype[method] = function (path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    options = _.defaults(options || {}, this.options);
    return new Promise(function (resolve, reject) {
      if (typeof path !== 'string') {
        throw new Error('Expect path to be a string');
      }
      if (path[0] !== '/') {
        path = '/' + path;
      }
      var query = {
        method: method,
        url: this.options.protocol + '://' + this.options.host + path,
        qs: options.qs,
        body: options.body,
        json: options.json
      };

      if (options.token) {
        query.headers = { Authorization: 'Bearer ' + options.token };
      }

      request(url, function (error, response, body) {
        if (error) {
          throw error;
        }
        if (response.statusCode.toString()[0] !== '2') {
          if (body && body.error) {
            throw createError(response.statusCode, body.error);
          }
          throw createError(response.statusCode);
        }
        resolve(body);
      });
    }.bind(this)).nodeify(callback);
  };
});

Shimo.prototype.del = Shimo.prototype.delete;

Shimo.prototype.token = function (grantType, options, callback) {
  return this.post('oauth/token', {
    json: false,
    body: _.assign(options, { grant_type: grantType })
  }, callback);
};

Shimo.prototype.authorization = function (options, callback) {
  return this.get('oauth/authorization', {
    qs: _.defaults(options, {
      client_id: this.options.clientId,
      response_type: 'code'
    })
  }, callback);
};

module.exports = Shimo;
