'use strict';

var request = require('request');
var Promise = require('bluebird');
var createError = require('http-errors');
var _ = require('lodash');

process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
var config = require('config');

function Shimo(options) {
  config.util.setModuleDefaults('shimo', _.defaults(options || {}, {
    json: true,
    protocol: 'https',
    host: 'api.shimo.im'
  }));
}

var methods = ['head', 'get', 'post', 'put', 'delete', 'patch'];

methods.forEach(function (method) {
  Shimo.prototype[method] = function (path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    options = _.defaults(options || {}, config.get('shimo'));
    return new Promise(function (resolve, reject) {
      if (typeof path !== 'string') {
        throw new Error('Expect path to be a string');
      }
      if (path[0] !== '/') {
        path = '/' + path;
      }
      var query = {
        method: method,
        url: config.get('shimo.protocol') + '://' + config.get('shimo.host') + path,
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
      client_id: config.get('shimo.clientId'),
      response_type: 'code'
    })
  }, callback);
};

module.exports = Shimo;
