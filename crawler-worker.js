'use sctrict';

var request = require("request"),
    gearman = require("node-gearman"),
    config = require('./environment.json'),
    gearmanClient = new gearman(config.gearman.host, config.gearman.port);
    
    if (!config.debugMode) {
        console.log = function(s) { };
    }
    
    gearmanClient.on("connect", function(){
        console.log("Connected to gearman server!");
    });
    
    gearmanClient.on("error", function(err){
        console.log(err);
        process.exit(1);
    });
    
    gearmanClient.connect();
    
//    var job = gearmanClient.submitJob("prerenderCrawler", '{"url":"http://ya.ru"}');
    gearmanClient.registerWorker("prerenderCrawler", function(payload, worker) {
        if(!payload){
            worker.error();
            return;
        }
        var url = JSON.parse(payload.toString("utf-8")).url;
        
        console.log('New incoming task: ' + url);
        
        request('http://' + config.prerender.host + ':' + config.prerender.port + '/' + url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log('... done.');
                worker.end();
            }
            else {
                console.log('Error crawling: ' + url, error);
            }
        });
    });