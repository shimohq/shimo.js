# Shimo.js
Official Shimo client for Node.js. Supports Node.js >= 0.10.

[![Build Status](https://travis-ci.org/shimohq/shimo.js.svg?branch=master)](https://travis-ci.org/shimohq/shimo.js)
[![Dependency Status](https://david-dm.org/shimohq/shimo.js.svg)](https://david-dm.org/shimohq/shimo.js)

## Links

[Shimo Open API Documentation](http://shimohq.github.io/doc)

## Install

```shell
npm install shimo
```

## Usage

```javascript
var Shimo = require('shimo');
var shimo = new Shimo({ version: 'v2' });
```

`Shimo` constructor accepts an option, where:

| name         | required | default      | description                                     |
|--------------|----------|--------------|-------------------------------------------------|
| version      | true     |              | API version                                     |
| protocol     | false    | https        | API protocol                                    |
| host         | false    | api.shimo.im | API host                                        |
| clientId     | false    | `null`       | Client id, used for requesting tokens           |
| clientSecret | false    | `null`       | Client secret, used for requesting tokens       |
| accessToken  | false    | `null`       | Access Token, used for access private resources |
| refreshToken | false    | `null`       | Refresh Token, used for exchanging access token |

API supports both Node-style callback and Bluebird Proimse:

```javascript
shimo.get('users/me', function (err, user) {});
shimo.get('users/me').then(function (user) {});
```

`accessToken` is required in order to access private resources. If `accessToken` is omitted or invalid (getting `401` error when accessing APIs), `refreshToken`, if present, would be used to exchange a new access token and refresh token.

## API

### Shimo#:httpMethod

Invoking Shimo Open API. Accepts three arguments:

| name     | required | description                                                    |
|----------|----------|----------------------------------------------------------------|
| path     | true     | API endpoint, e.g. `'users/me'`                                |
| option   | false    | API options, e.g. `{ qs: { id: 12 }, body: { title: 'new' } }` |
| callback | false    | Callback function. If omitted, a promise will be returned      |

Example:

```javascript
shimo.post('files', { body: { name: 'Untitled Document' } });
```

### Shimo#token

Requesting tokens. Accepts three arguments:

| name       | required | description                                               |
|------------|----------|-----------------------------------------------------------|
| grant type | true     | Grant type, e.g. `'refresh_token'`, `'password'`          |
| option     | false    | Token options, e.g. `{ scope: 'read' }`                   |
| callback   | false    | Callback function. If omitted, a promise will be returned |

Example:

```javascript
shimo.token('authorization', {
  code: req.query.code,
  redirect_uri: 'https://yourapp.tld/oauth/callback'
});
```

### Shimo#authorization

Getting authorization endpoint url.

Example:

```javascript
// redirect user to the authorization page
res.redirect(shimo.authorization({
  redirect_uri: 'https://yourapp.tld/oauth/callback'
}));
```

## Events

Shimo extends `EventEmitter` and will emit the following events:

### accesstoken_change

When access token changed, the first argument is the new access token.

Example:
```javascript
shimo.on('accesstoken_change', function (accessToken) { });
```

### refreshtoken_change

When refresh token changed, the first argument is the new refresh token.

Example:
```javascript
shimo.on('refreshtoken_change', function (refreshToken) {
  req.session.refreshToken = refreshToken;
});
```
