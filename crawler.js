'use sctrict';

var redis = require("redis"),
    client = null,
    request = require("request"),
    _ = require("underscore"),
    config = require('./environment.json'),
    app = module.exports = _.extend({
        crawlerState: 'ready',
        processedUrlIndex : 0,
        watchingQueue: [],
        CRAWLER_READY: 'ready',
        CRAWLER_BUSY: 'process',
        
        clearWatchingQueue: function() {
            this.watchingQueue = [];
        },
        getWatchingQueueLength: function() {
            return this.watchingQueue.length;
        },
        getCurrentTask: function() {
            return this.watchingQueue[this.processedUrlIndex];
        },
        getCurrentTaskId: function() {
            return this.processedUrlIndex;
        },
        setCurrentTaskId: function(id) {
            this.processedUrlIndex = id; 
        },
        nextTask: function() {
            if (++this.processedUrlIndex > this.watchingQueue.length - 1) {
                this.processedUrlIndex = 0;
            }
        },
        setCrawlerState: function(state) {
            this.crawlerState = state;
        },
        getCrawlerState: function() {
            return this.crawlerState;
        },
        updateWatchingList: function() {
            var self = this;
            
            setInterval((function() {
                client.hkeys("crawler:watch", function (err, urls) {
                    self.clearWatchingQueue();
                    self.setCurrentTaskId(0);
                    _.each(urls, function(url) {
                        if (!_.contains(self.watchingQueue, url)) {
                            self.watchingQueue.push(url);
                        }
                    });
                });
                return arguments.callee;
            })(), 
            config.watchListUpdateInterval * 1000 || 3600000);
        },
        
        crawler: function() {
            var self = this;
            var prerenderURL = config.prerenderServerUrl || 'http://localhost:3000/';
            
            setInterval(function() {
                if (self.getCrawlerState() === self.CRAWLER_READY) {
                    if (self.getWatchingQueueLength() > 0) {
                        // Looking for cache existing for the current url
                        client.ttl(self.getCurrentTask(), function(err, res) {
                            console.log(new Date() + " start crawling: " + self.getCurrentTask() + ", task: " + (self.getCurrentTaskId() + 1) + " of " +self.getWatchingQueueLength());
                            if (res < 0) {
                                self.setCrawlerState(self.CRAWLER_BUSY);
                                request(prerenderURL + self.getCurrentTask(), function (error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        console.log(new Date() + " ... done.");
                                        self.setCrawlerState(self.CRAWLER_READY);
                                    }
                                    else {
                                        client.hdel("crawler:watch", self.getCurrentTask(), function() {
                                            console.log('Error: ' + response.statusCode + " > crawler:watch " + self.getCurrentTask() + " deleted.");
                                            self.setCrawlerState(self.CRAWLER_READY);
                                        });
                                    }
                                    self.nextTask();
                                });
                            }
                            else {
                                console.log(new Date() + ' ... cache exists.');
                                self.setCrawlerState(self.CRAWLER_READY);
                                self.nextTask();
                            }
                        });
                    }
                }
                else if (self.getWatchingQueueLength() === 0) {
                    self.setCrawlerState(self.CRAWLER_READY);
                }
            }, 
            config.crawlerScrapInterval * 1000 || 1000);
        },
        initialize: function() {
            if (!config.debugMode) {
                console.log = function(s) { };
            }
            var redisHost = config.redisServerHost || '127.0.0.1';
            var redisPort = config.redisServerPort || '6379';
            client = redis.createClient(redisPort, redisHost);
            this.updateWatchingList();
            this.crawler();
        }
    })
    .initialize();