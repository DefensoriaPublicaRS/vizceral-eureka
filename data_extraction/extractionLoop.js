const config = require('../configuration').get();
let vizceralCache = require('../vizceralCache.js');
let discoveryClient = require('./discoveryClient');
let metrics = require('./metrics');
let mutex = require('./mutex');
let _ = require('underscore');

const Global = require('./vizceralElements/global');
const Region = require('./vizceralElements/region');
const Connection = require('./vizceralElements/connection');
const Node = require("./vizceralElements/node");
const Notice = require("./vizceralElements/notice");
const Severity = require("./vizceralElements/severity");

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
        let region = new Region(regionConfig.name);
        global.addNode(region);

        applications.forEach(servico => {
            servico.instance.forEach(instancia => {

                if (regionConfig.matcher(instancia.ipAddr)) {

                    let node = new Node(instancia.app, instancia.app);
                    region.addNode(node);

                    promises.push(
                        metrics.getMetricsAsNode(instancia, region).then(hystrixService => {

                            if (!hystrixService.targets.length) {
                                node.notices.push(new Notice("Couldn't find any hystrix metric for this service", null, Severity.info, null));
                            }

                            hystrixService.targets.forEach(target => {

                                region.addConnection(new Connection(
                                    instancia.app,
                                    target.name,
                                    target.requestCount - target.errorCount,
                                    0,
                                    target.errorCount,
                                    null, null));


                                target.methods.forEach(method => {
                                    if (method.errorCount > 0) {
                                        const message = method.errorCount + " errors with [" + target.name + "] => " + method.method;
                                        node.notices.push(new Notice(message, null, Severity.danger, null));
                                    } else {
                                        if (method.latency >= config.vizceral.alertAtLatency) {
                                            let latency = parseFloat((method.latency / 1000).toString()).toFixed(2);
                                            const latencyMessage = "[" + latency + "] seconds in " + target.name + '.' + method.method + " latency.";
                                            node.notices.push(new Notice(latencyMessage, null, Severity.alert, null));
                                        }
                                    }
                                });
                            })
                        }).catch(error => {
                            node.notices.push(new Notice(error, null, Severity.alert, null));
                        })
                    );
                }
            });
        });

    });

    Promise.all(promises).then(x => {

        global.nodes.forEach(region => {
            if (region.name !== global.entryNode) {
                let counter = region.countRequests();
                console.log(region.name, counter);
                global.addConnection(new Connection(global.entryNode, region.name, counter.normal, counter.warning, counter.danger, null, null));
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
