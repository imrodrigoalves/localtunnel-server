#!/usr/bin/env node

import 'localenv';
import optimist from 'optimist';

import log from 'book';
import Debug from 'debug';

import CreateServer from '../src/server.js';
import yn from 'yn';

const debug = Debug('localtunnel');

const argv = optimist
  .usage(
    'Usage: $0 [--port num] [--address address] [--domain domain] [--max-sockets 10] [--client-min-port-range 3000 --client-max-port-range 3500]'
  )
  .options('secure', {
    default: false,
    describe: 'use this flag to indicate proxy over https',
  })
  .options('port', {
    default: '8080',
    describe: 'listen on this port for outside requests',
  })
  .options('address', {
    default: '0.0.0.0',
    describe: 'IP address to bind to',
  })
  .options('domain', {
    describe:
      'Specify the base domain name. This is optional if hosting localtunnel from a regular example.com domain. This is required if hosting a localtunnel server from a subdomain (i.e. lt.example.dom where clients will be client-app.lt.example.come)',
  })
  .options('max-sockets', {
    default: 10,
    describe:
      'maximum number of tcp sockets each client is allowed to establish at one time (the tunnels)',
  })
  .options('client-min-port-range', {
    default: 1024,
    describe: 'Port start range to use for localtunnel clients to connect to',
  })
  .options('client-max-port-range', {
    default: 65535,
    describe: 'Port end range to use for localtunnel clients to connect to',
  }).argv;

if (argv.help) {
  optimist.showHelp();
  process.exit();
}

const server = CreateServer({
  max_tcp_sockets: process.env.MAX_SOCKETS || argv['max-sockets'],
  secure: yn(process.env.SECURE) || argv.secure,
  domain: process.env.DOMAIN || argv.domain,
  client_min_port_range: process.env.CLIENT_MIN_PORT_RANGE || argv['client-min-port-range'],
  client_max_port_range: process.env.CLIENT_MAX_PORT_RANGE || argv['client-max-port-range'],
});

server.listen(argv.port, argv.address, () => {
  debug('server listening on port: %d', server.address().port);
});

process.on('SIGINT', () => {
  process.exit();
});

process.on('SIGTERM', () => {
  process.exit();
});

process.on('uncaughtException', (err) => {
  log.error(err);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error(reason);
});

// vim: ft=javascript
