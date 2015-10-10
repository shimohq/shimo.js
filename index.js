'use strict';

var request = require('request');
var Promise = require('bluebird');
var createError = require('http-errors');

function Shimo(options) {
  options = options || {};
  options.protocol = options.protocol || 'https';
  options.host = options.host || 'api.shimo.im';
}

var methods = ['head', 'get', 'post', 'put', 'delete', 'patch'];

methods.forEach(function (method) {
  Shimo.prototype[method] = function (path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    return new Promise(function (resolve, reject) {
      if (typeof path !== 'string') {
        throw new Error('Expect path to be a string');
      }
      if (path[0] !== '/') {
        path = '/' + path;
      }
      var query = {
        method: method,
        url: this.options.protocol + '://' + this.options.host + path
      };

      if (options) {
        query.qs = options.qs;
        query.body = options.body;
        query.json = true;
      }

      if (this.options.token) {
        query.headers = { Authorization: 'Bearer ' + this.options.token };
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
    }).nodeify(callback);
  };
});

Shimo.prototype.del = Shimo.prototype.delete;

module.exports = Shimo;
