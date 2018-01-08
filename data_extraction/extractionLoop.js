var vizceralCache = require('../vizceralCache.js');
const cloudConfigClient = require("cloud-config-client");
let configuration = require('../configuration').get();
let discoveryClientFactory = require('./discoveryClient');
var metrics = require('./metrics');
var convertToVizceral = require('./vizceralConverter');

var _ = require('underscore');

var applications = [];
var servicos = {};

var discoveryClient = null;

console.log('Getting configuration for ' + configuration.application + ". Profiles: " + configuration.profiles);
cloudConfigClient.load(configuration).then(config => {
    discoveryClient = discoveryClientFactory(null, config);
    setInterval(getApplicationsList, 60 * 1000);
    getApplicationsList();
});

function startLoop() {
    updateMetrics();
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

function getApplicationsList() {
    console.log("Updating application list");
    discoveryClient.getApplications()
        .then(apps => {
            applications = apps
        })
        .catch(err => {
            console.error(err);
            throw err
        });
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
