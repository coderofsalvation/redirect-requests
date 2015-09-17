'use strict';

/**
 * Dependencies
 */

var prependHttp = require('prepend-http');
var parse = require('url').parse;
var mitm = require('mitm');
var got = require('got');


/**
 * Expose `redirect-requests`
 */

module.exports = exports = redirect;

exports.enable = enable;
exports.disable = disable;
exports.clear = clear;


/**
 * Configuration
 */

// source -> destination mapping
var mapping = [];

// interceptor, mitm instance
var interceptor;


/**
 * Redirect requests to another server
 */

function redirect (src, dest) {
  mapping.push({
    src: parse(normalizeUrl(src)),
    dest: parse(normalizeUrl(dest))
  });
}


/**
 * Enable interceptor
 */

function enable () {
  interceptor = mitm();
  interceptor.on('connect', proxyConnection);
  interceptor.on('request', proxyRequest);
}

function proxyConnection (socket, opts) {
  var mustRedirect = false;

  mapping.forEach(function (item) {
    var protocolsEqual = item.src.protocol === opts.protocol;
    var hostsEqual = item.src.hostname === opts.hostname;
    var portsEqual = item.src.port == opts.port;

    if (protocolsEqual && hostsEqual && portsEqual) {
      mustRedirect = true;
    }
  });

  if (!mustRedirect) return socket.bypass();
}

function proxyRequest (req, res) {
  var dest;

  mapping.forEach(function (item) {
    var hostsEqual = item.src.hostname === req.headers.host;

    if (hostsEqual) {
      dest = item.dest;
    }
  });

  var proxy = got.stream(dest.protocol + '//' + dest.host + req.url);

  // pipe input to destination
  req.pipe(proxy);

  // pipe output from destination
  proxy.pipe(res);
}


/**
 * Disable interceptor
 */

function disable () {
  interceptor.off('connect', proxyConnection);
  interceptor.off('request', proxyRequest);
  interceptor.disable();
  interceptor = null;
}


/**
 * Clear all mappings
 */

function clear () {
  mapping.length = 0;
}


/**
 * Helpers
 */

function normalizeUrl (url) {
  return prependHttp(appendPort(url));
}

function appendPort (host, port) {
  if (!port) {
    port = 80;
  }

  var hasPort = /\:[0-9]+$/.test(host);

  if (!hasPort) {
    host += ':' + port;
  }

  return host;
}
