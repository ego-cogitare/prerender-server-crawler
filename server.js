#!/usr/bin/env node
var prerender = require('prerender/lib');

var server = prerender({
    workers: process.env.PHANTOM_CLUSTER_NUM_WORKERS || 5,
    iterations: process.env.PHANTOM_WORKER_ITERATIONS || 3,
    phantomBasePort: process.env.PHANTOM_CLUSTER_BASE_PORT || 12300,
    jsTimeout: 10000
});

server.use(require('prerender-redis-cache'));
//server.use(require('prerender-file-cache'));
// server.use(prerender.basicAuth());
// server.use(prerender.whitelist());
//server.use(prerender.blacklist());
// server.use(prerender.logger());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
//server.use(prerender.inMemoryHtmlCache());
// server.use(prerender.s3HtmlCache());

server.start();
