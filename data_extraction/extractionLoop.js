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
    let regionCluster = new Region('Cluster', Date.now());
    let regionSwarm = new Region('Swarm', Date.now());

    global.addNode(regionCluster);
    global.addNode(regionSwarm);

    global.addConnection(global.entryNode, regionCluster.name, 100, 50, 100, null);

    let promises = [];

    applications.forEach(servico => {
        servico.instance.forEach(instancia => {
            promises.push(metrics.getMetricsAsNode(instancia, regionCluster));
        })
    });

    Promise.all(promises).then(x => {
        mutex.unlock();
        vizceralCache.set(global);
    })

}

module.exports = {
    startLoop: startLoop
};
