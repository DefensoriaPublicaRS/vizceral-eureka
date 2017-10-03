var express = require('express');
var app = express();
require('promise.prototype.finally').shim()
const cloudConfigClient = require("cloud-config-client");
var configuration = require('./configuration').get();
var discoveryClientFactory = require('./discoveryClient')

var metrics = require('./metrics');

var _ = require('underscore')

var applications = []

var discoveryClient = null;
console.log('Getting configuration for ' + configuration.application + ". Profiles: " + configuration.profiles)
cloudConfigClient.load(configuration).then(config => {
    discoveryClient = discoveryClientFactory(null,config)
    setInterval(getApplicationsList,60*1*1000)
    getApplicationsList();
})

function getApplicationsList(){
    discoveryClient.getApplications().then( apps => {
        applications = apps;
    }).catch(err => {
        throw err
    });
}


function getMetrics(apps,emit,done){

    var count = _(apps).reduce((sum, app) => {
        return app.instance.length + sum;
    }, 0);
    console.log("Getting metrings for " +count+" instances");
    _(apps).each(app => {

        _(app.instance).each(instance => {
            var addr = 'http://' + instance.ipAddr + ':'+ instance.port.$;
            metrics.getSuccessFailureByService(addr).then(res => {
                emit(res,app.name)

            }).catch(err =>{})
            .finally( function() {

                count--;
                if (count == 0){
                    done();
                }
            })
        })
    })
}


app.get("/graph", (req,response) => {
    response.write('{ ')
    var started = false;
    getMetrics(applications,(res,name) => {
        if (started){
            response.write(',');
        }
        started = true;
        response.write('"' + name.toLowerCase() + '":');
        response.write(JSON.stringify(res))
    },
    function(){
        console.log("done!")
        response.write('}')
        response.end();
    })
})



app.use(express.static('static'));


console.log('Starting server on port ' + configuration.serverPort);
app.listen(configuration.serverPort);
