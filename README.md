### crawler.js

Crawler for static html-pages update.

#### environment.json parametres:

    debugMode               - enabling (true) or disabling (false) console.log verboses
    watchListUpdateInterval - time interval to update watching domains queue from redis
    crawlerScrapInterval    - time intervals to scraping urls from queue
    prerenderServerUrl      - prerender server (phantom server) url for static html-pages rendering


### sitemapScrapper.js
Fetch domains from crawler:domains redis hset and parse sitemap.xml. Parsed data 
stored in crawler:watch redis hset.


### Supervisor config example:
```ini
[program:phantomjsServer]
command=node server.js
numprocs=1
process_name=%(program_name)s_%(process_num)02d
directory=/home/abogish/expressible/prerender/
stdout_logfile=/home/abogish/expressible/prerender/supervisord-server.log
environment=PAGE_TTL="172800",REDIS_URL="redis://127.0.0.1:6379",PAGE_DONE_CHECK_TIMEOUT="3000",RESOURCE_DOWNLOAD_TIMEOUT="10000",WAIT_AFTER_LAST_REQUEST="500",JS_CHECK_TIMEOUT="3000",JS_TIMEOUT="3000",NO_JS_EXECUTION_TIMEOUT="30000",EVALUATE_JAVASCRIPT_CHECK_TIMEOUT="30000",NUM_ITERATIONS="40"
autostart=true
autorestart=true
user=abogish
stopsignal=KILL

[program:sitemapScrapper]
command=node sitemapScrapper.js
numprocs=1
process_name=%(program_name)s_%(process_num)02d
directory=/home/abogish/expressible/prerender/
stdout_logfile=/home/abogish/expressible/prerender/supervisord-sitemapScrapper.log
autostart=true
autorestart=true
user=abogish
stopsignal=KILL

[program:ownCrawler]
command=node crawler.js
numprocs=1
process_name=%(program_name)s_%(process_num)02d
directory=/home/abogish/expressible/prerender/
stdout_logfile=/home/abogish/expressible/prerender/supervisord-crawler.log
autostart=true
autorestart=true
user=abogish
stopsignal=KILL
```
