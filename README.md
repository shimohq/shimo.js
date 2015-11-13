# Shimo.js
Official Shimo client for Node.js.

[![Build Status](https://travis-ci.org/shimohq/shimo.js.svg?branch=master)](https://travis-ci.org/shimohq/shimo.js)

## Install

```shell
npm install shimo
```

## Usage

```javascript
var Shimo = require('shimo');

var shimo = new Shimo();
```

`Shimo` constructor accepts an option, where:

* `option.protocol`: [Optional] API protocol, defaults to 'https';
* `option.host`: [Optional] API host, defaults to 'api.shimo.im';
* `option.clientId`: [Optional] Client id, used to refresh token;
* `option.accessToken`: [Optional] Access token of the user, defaults to null;
* `option.refreshToken`: [Optional] Refresh token of the user, defaults to null;

API supports both Node-style callback and Bluebird Proimse:

```javascript
shimo.get('users/me', function (err, user) {});
shimo.get('users/me').then(function (user) {});

shimo.post('files', { body: { name: 'Untitled Document' } });
```

`accessToken` is required in order to access private resources. If `accessToken` is omitted or invalid (getting `401` error when accessing APIs), `refreshToken`, if present, would be used to exchange a new access token and refresh token.
