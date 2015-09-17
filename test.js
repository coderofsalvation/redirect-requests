'use strict';

/**
 * Dependencies
 */

const redirect = require('./');
const http = require('http');
const test = require('ava');
const got = require('got');

const before = test.before;
const after = test.after;


/**
 * Tests
 */

let server;

before (function (t) {
  server = http.createServer(function (req, res) {
    server.emit(req.url, req, res);
  });

  server.listen(9999, function () {
    t.end();
  });
});

test ('redirect request', function (t) {
  t.plan(4);

  server.on('/some/path', function (req, res) {
    res.write('ok');
    res.end();
  });

  redirect.enable();

  redirect('google.com', 'localhost:9999');

  got('http://google.com/some/path', function (err, body, res) {
    redirect.disable();

    t.ifError(err);
    t.is(body, 'ok');

    got('http://google.com', function (err, body) {
      t.ifError(err);
      t.true(body !== 'ok');
    });
  });
});

after (function (t) {
  server.close();
  t.end();
});
