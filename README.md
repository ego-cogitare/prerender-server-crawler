################################################################################
 crawler.js

Crawler for static html-pages update.

./config/environment.json parametres:

    debugMode               - enabling (true) or disabling (false) console.log verboses
    watchListUpdateInterval - time interval to update watching domains queue from redis
    crawlerScrapInterval    - time intervals to scraping urls from queue
    prerenderServerUrl      - prerender server (phantom server) url for static html-pages rendering




################################################################################
 sitemapScrapper.js

Fetch domains from crawler:domains redis hset and parse sitemap.xml. Parsed data 
stored in crawler:watch redis hset.