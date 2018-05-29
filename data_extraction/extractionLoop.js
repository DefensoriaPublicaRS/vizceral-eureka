var vizceralCache = require('../vizceralCache.js');
let discoveryClient = require('./discoveryClient');
var metrics = require('./metrics');
var convertToVizceral = require('./vizceralConverter');
var mutex = require('./mutex');

var _ = require('underscore');

let applications = [];
var servicos = {};

function startLoop() {

    applications = discoveryClient.getApplicationList();

    if(applications.length > 0) {
        if(!mutex.isLocked()) {
            mutex.lock();
            updateMetrics();
        } else {
            console.log("Semaphore is closed.")
        }
    }else{
        console.log("No applications retrieved from eureka to be processed.")
    }
    setTimeout(startLoop, 8000);
}

function updateMetrics() {

    servicos = {};

    getMetrics(applications, (res, name, instanceId) => {

        if(servicos[name] === undefined) {
            servicos[name] = res;
        } else {
            mergeObjects(servicos[name], res);
        }

        if(servicos[name].instancias === undefined) {
            servicos[name].instancias = {}
        }

        servicos[name].instancias[instanceId] = {
            requestcount: res.requestcount,
            errorcount: res.errorcount
        };

    })
}

function getMetrics(apps, emit) {

    var count = _(apps).reduce((sum, app) => {
        return app.instance.length + sum;
    }, 0);

    console.log("Getting metrings for " + count + " instances");

    _(apps).each(app => {

        _(app.instance).each(instance => {
            let addr = 'http://' + instance.ipAddr + ':' + instance.port.$;
            metrics.getSuccessFailureByService(addr)
                .then(res => {
                    emit(res, app.name.toLowerCase(), instance.instanceId)
                })
                .catch(err => {
                })
                .finally(function() {
                    count--;
                    if(count === 0) {
                        vizceralCache.set(convertToVizceral.convert(servicos));
                        mutex.unlock();
                        console.log("done!");
                    }
                })
        })
    })
}

function mergeObjects(obj1, obj2) {
    _(Object.keys(obj1)).each(key => {
        if(obj2[key] !== undefined && typeof obj2[key] !== "object") {
            obj1[key] += obj2[key];
        } else if(typeof obj2[key] === "object") {
            mergeObjects(obj1[key], obj2[key])
        }
    });

    _(Object.keys(obj2)).each(key => {
        if(obj1[key] === undefined) {
            obj1[key] = obj2[key];
        }
    });
    return obj1;
}

module.exports = {
    startLoop: startLoop
};
