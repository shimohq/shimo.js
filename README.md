# shimo.js
Official Shimo client for Node.js

## Install

```shell
npm install shimo
```

## Usage

```javascript
var Shimo = require('shimo');

var shimo = new Shimo();
```

`Shimo` constructor accepts an option where:

* option.protocol: API protocol, defaults to 'https';
* option.host: API host, defaults to 'api.shimo.im';
* option.token: Access token of the user, defaults to null;

```javascript
shimo.get('users/me', function (err, user) {});
shimo.get('users/me').then(function (user) {});

shimo.post('files', { body: { name: 'Untitled Document' } });
```
