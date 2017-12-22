var express = require('express');
var app = express();
require('promise.prototype.finally').shim();
const cloudConfigClient = require("cloud-config-client");
var configuration = require('./configuration').get();
var discoveryClientFactory = require('./discoveryClient');

var metrics = require('./metrics');

var _ = require('underscore');

var applications = [];

var discoveryClient = null;
console.log('Getting configuration for ' + configuration.application + ". Profiles: " + configuration.profiles);
cloudConfigClient.load(configuration).then(config => {
    discoveryClient = discoveryClientFactory(null, config)
    setInterval(getApplicationsList, 60 * 1 * 1000)
    getApplicationsList();
})

function getApplicationsList() {
    discoveryClient.getApplications()
        .then(apps => {
            applications = apps
        })
        .catch(err => {
            throw err
        });
}


function getMetrics(apps, emit, done) {

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
                        done();
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

app.get("/graph", (req, response) => {
    let servicos = {};

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

        },
        function() {
            console.log("done!");
            response.write(JSON.stringify(servicos));
            response.end();
        })
});


app.use(express.static('static'));


console.log('Starting server on port ' + configuration.serverPort);
app.listen(configuration.serverPort);
