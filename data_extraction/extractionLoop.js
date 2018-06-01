const config = require('../configuration').get();
let vizceralCache = require('../vizceralCache.js');
let discoveryClient = require('./discoveryClient');
let metrics = require('./metrics');
let mutex = require('./mutex');
let _ = require('underscore');

let Global = require('./vizceralElements/global');
let Region = require('./vizceralElements/region');

let applications = [];
let global = {};

function startLoop() {

    applications = discoveryClient.getApplicationList();

    if (applications.length > 0) {
        if (!mutex.isLocked()) {
            mutex.lock();
            updateData();
        } else {
            console.log("Semaphore is closed.")
        }
    } else {
        console.log("No applications retrieved from eureka to be processed.")
    }
    setTimeout(startLoop, 8000);
}

function updateData() {

    global = new Global();

    let promises = [];

    console.log("Updating applications metrics.");

    config.vizceral.regions.forEach(regionConfig => {
        let region = new Region(regionConfig.name, Date.now());
        global.addNode(region);

        applications.forEach(servico => {
            servico.instance.forEach(instancia => {
                if (regionConfig.matcher(instancia.ipAddr)) {
                    promises.push(metrics.getMetricsAsNode(instancia, region));
                }
            });
        });

    });

    Promise.all(promises).then(x => {

        global.nodes.forEach(region => {
            if(region.name !== global.entryNode){
                let counter = region.countRequests();
                console.log(region.name, counter);
                global.addConnection(global.entryNode, region.name, counter.normal, counter.warning, counter.danger, null);
                global.nodes[0].merge(region);
            }
        });

        mutex.unlock();
        vizceralCache.set(global);
    })

}

module.exports = {
    startLoop: startLoop
};
