# redirect-requests

Redirect requests transparently to other server.
Useful for testing code, that sends requests to remote servers.


### Installation

```
$ npm install redirect-requests --save
```


### Usage

Example usage with [got](https://npmjs.org/package/got) request library:

```js
const redirect = require('redirect-requests');
const got = require('got');

redirect('ghost.org', 'localhost:8080');

// enable interceptor
redirect.enable();

got('http://ghost.org/some/path', function (err, body) {
  // request will not be sent to ghost.org
  // but to localhost:8080

  // after you are done, disable redirect
  redirect.disable();
});
```


### Tests

```
$ make test
```

### License

MIT @ Vadim Demedes.
