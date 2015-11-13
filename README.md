# Shimo.js
Official Shimo client for Node.js. Supports Node.js >= 0.10.

[![Build Status](https://travis-ci.org/shimohq/shimo.js.svg?branch=master)](https://travis-ci.org/shimohq/shimo.js)
[![Dependency Status](https://david-dm.org/shimohq/shimo.js.svg)](https://david-dm.org/shimohq/shimo.js)

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

| name         | required | default      | description                                     |
|--------------|----------|--------------|-------------------------------------------------|
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

shimo.post('files', { body: { name: 'Untitled Document' } });
```

`accessToken` is required in order to access private resources. If `accessToken` is omitted or invalid (getting `401` error when accessing APIs), `refreshToken`, if present, would be used to exchange a new access token and refresh token.
