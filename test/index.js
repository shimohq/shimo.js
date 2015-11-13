'use strict';

var expect = require('chai').expect;
var Shimo = require('..');
var Promise = require('bluebird');

describe('shimo', function () {
  it('has default options', function () {
    var shimo = new Shimo();
    expect(shimo.options.protocol).to.eql('https');
    expect(shimo.options.host).to.eql('api.shimo.im');
    expect(shimo.options.base).to.eql('https://api.shimo.im');
  });

  describe('#:method', function () {
    it('should send correct options', function (done) {
      var shimo = new Shimo();
      shimo._request = function (options) {
        expect(options.json).to.eql(true);
        expect(options.method).to.eql('post');
        expect(options.path).to.eql('foo');
        expect(options.qs).to.eql({ q: 1 });
        expect(options.body).to.eql({ b: 1 });
        setTimeout(done, 0);
        return Promise.resolve(1);
      };
      shimo.post('foo', { qs: { q: 1 }, body: { b: 1 } });
    });

    it('should return results', function (done) {
      var shimo = new Shimo();
      shimo.get('', function (err, res) {
        expect(err).to.eql(null);
        expect(res).to.match(/shimo-api/);
        done();
      });
    });
  });

  describe('#token', function () {
    it('should send correct options', function (done) {
      var shimo = new Shimo();
      shimo._request = function (options) {
        expect(options.json).to.eql(false);
        expect(options.method).to.eql('post');
        expect(options.path).to.eql('oauth/token');
        expect(options.body).to.eql({ grant_type: 'refresh_token', refresh_token: 'token' });
        setTimeout(done, 0);
        return Promise.resolve(1);
      };
      shimo.token('refresh_token', { refresh_token: 'token' });
    });
  });

  describe('#authorization', function () {
    it('should return correct url', function () {
      var shimo = new Shimo({ clientId: '123' });
      var url = shimo.authorization({ redirect_uri: 'http://my.tld/path?q=6' });
      var parsedUrl = require('url').parse(url, true);
      expect(parsedUrl.protocol).to.eql('https:');
      expect(parsedUrl.host).to.eql('api.shimo.im');
      expect(parsedUrl.pathname).to.eql('/oauth/authorization');
      expect(parsedUrl.query.redirect_uri).to.eql('http://my.tld/path?q=6');
      expect(parsedUrl.query.client_id).to.eql('123');
      expect(parsedUrl.query.response_type).to.eql('code');
    });
  });
});
