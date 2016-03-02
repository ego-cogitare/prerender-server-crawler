'use sctrict';

var robots = require('robots'), 
    parser = new robots.RobotsParser(),
    sitemap = require("sitemapper/lib/sitemap"),
    redis = require("redis"),
    client = null,
    url = require('url'),
    config = require('./environment.json'),
    _ = require("underscore"),
    app = module.exports = _.extend({
        siteMapParser: function() {
            setInterval((function() {
                console.log('Sitemap parser start at: ', new Date());
                
                client.hkeys("crawler:domains", function (err, domains) {
                    _.each(domains, function(domain) {
                        parser.setUrl(domain + 'robots.txt', function (parser, success) {
                            if (success) {
                                parser.canFetch('*', '/doc/dailyjs-nodepad/', function (access) {
                                    if (access) {
                                        _.each(parser.sitemaps, function(siteMapUrl) {
                                            sitemap.getSites(siteMapUrl, function(error, sites) {
                                                if(!error) {
                                                    // Add sitemap url to crawler watching url
                                                    _.each(sites, function(site) {
                                                        client.hmset("crawler:watch", site, "", function (err, res) {});
                                                    });
                                                }
                                                else {
                                                    console.log(error);
                                                }
                                            });
                                        }); 
                                        parser.sitemaps = [];
                                    }
                                    else {
                                        console.log('Error: sitemap ', domain + 'robots.txt is unavailable.');
                                    }
                                });
                            }
                            else {
                                // Delete url which already not need to watch
                                client.hgetall("crawler:watch", function (err, rows) {
                                    _.each(rows, function(val, link) {
                                        if (url.parse(domain).hostname === url.parse(link).hostname) {
                                            client.hdel("crawler:watch", link, function() {
                                                console.log("crawler:watch " + link + " deleted.");
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
                return arguments.callee;
            })(), 
            config.siteMapParseInterval * 1000 || 3600000);
        },
        initialize: function() {
            if (!config.debugMode) {
                console.log = function(s) { };
            }
            var redisHost = config.redisServerHost || '127.0.0.1';
            var redisPort = config.redisServerPort || '6379';
            client = redis.createClient(redisPort, redisHost);
            this.siteMapParser();
        }
    })
    .initialize();