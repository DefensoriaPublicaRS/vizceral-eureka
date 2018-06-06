const axios = require("axios");
const Node = require("./vizceralElements/node");
const Connection = require("./vizceralElements/connection");
const Notice = require("./vizceralElements/notice");
const Severity = require("./vizceralElements/severity");

const HystrixService = require("./metrics/hystrixService");
const HystrixTarget = require("./metrics/hystrixTarget");
const HystrixMethod = require("./metrics/hystrixMethod");

let _ = require('underscore');

let PREFIX = "gauge.servo.hystrix.hystrixcommand";
let SUFIX_REQUEST_COUNT = "requestcount";
let SUFIX_ERROR_COUNT = "errorcount";
let SUFIX_LETENCY = "latencytotal_mean";

let metrics = {
    getMetricsAsNode: function (instance, region) {

        let address = 'http://' + instance.ipAddr + ':' + instance.port.$ + '/metrics';

        return getMetrics(address)
            .then(res => {

                let service = new HystrixService(instance.app);

                let metricKeys = Object.keys(res).filter(line => {
                    return line.startsWith(PREFIX) &&
                        (line.endsWith(SUFIX_REQUEST_COUNT) || line.endsWith(SUFIX_ERROR_COUNT) || line.endsWith(SUFIX_LETENCY));
                });

                metricKeys.forEach(key => {
                    let target = keyToTarget(key, res);
                    service.addTarget(target);
                });

                return service;

            })
            .catch(error => {
                throw message = "Error trying to get metrics: " + error.message;
            });
    }
};

function keyToTarget(key, response) {
    let split, target, method, value;

    const isRibbonMetrics = key.indexOf('ribboncommand') > -1;

    if (isRibbonMetrics) {
        split = key.split(PREFIX + '.ribboncommand.');
    } else {
        split = key.split(PREFIX + '.');
    }

    split = split[1].split('.');

    value = response[key];

    split.forEach((item, index) => {
        switch (index) {
            case 0:
                target = new HystrixTarget(item);
                break;
            case 1:
                method = new HystrixMethod(item);
                if (isRibbonMetrics) { methodSwitch(item, value, method); }
                break;
            case 2:
                methodSwitch(item, value, method);
                break;
        }
    });

    target.addMethod(method);
    return target;
}

function methodSwitch(item, value, method) {
    switch (item) {
        case SUFIX_REQUEST_COUNT:
            method.requestCount = value;
            break;
        case SUFIX_ERROR_COUNT:
            method.errorCount = value;
            break;
        case SUFIX_LETENCY:
            method.latency = value;
            break;
    }
}

function getMetrics(address) {
    return axios.get(address, {
        headers: {'Content-type': 'application/json'},
        timeout: 3000
    }).then(response => {
        return response.data
    });
}

module.exports = metrics;
