const axios = require("axios");
const Node = require("./vizceralElements/node");
const Notice = require("./vizceralElements/notice");
const Severity = require("./vizceralElements/severity");
let _ = require('underscore');

let metrics = {
    getMetricsAsNode: function (instance, region) {

        let address = 'http://' + instance.ipAddr + ':' + instance.port.$ + '/metrics';

        return getMetrics(address)
            .then(res => {
                let metrics = _(res).pick((value, key) => {
                    let last = _(key.split('.')).last();
                    return (last === 'errorcount' || last === 'requestcount');
                });

                let aggregate = {requestcount: 0, errorcount: 0, targets: {}};

                _(metrics).each((value, key) => {
                    let splitkey = key.split('.');
                    let service;
                    let method;
                    if (splitkey[4] === 'ribboncommand') {
                        service = splitkey[5];
                        method = splitkey[4];
                    } else {
                        service = splitkey[4];
                        method = splitkey[5];
                    }

                    if (!aggregate.targets[service]) {
                        aggregate.targets[service] = {errorcount: 0, requestcount: 0}
                    }
                    if (!aggregate.targets[service][method]) {
                        aggregate.targets[service][method] = {errorcount: 0, requestcount: 0}
                    }
                    if (splitkey[6] === 'requestcount') {
                        aggregate.requestcount += value;
                        aggregate.targets[service].requestcount += value;
                        aggregate.targets[service][method].requestcount += value;
                    } else {
                        aggregate.errorcount += value;
                        aggregate.targets[service].errorcount += value;
                        aggregate.targets[service][method].errorcount += value;
                    }
                });

                let node = new Node(instance.app, instance.app);
                region.addNode(node);

                Object.keys(aggregate.targets).forEach(item => {
                    let error = aggregate.targets[item].errorcount;
                    let request = aggregate.targets[item].requestcount;
                    let sucess = request-error;
                    region.addConnection(instance.app, item, sucess, 0, error, null);
                })

                console.log("Resolveu: ", instance.app);

            })
            .catch(error => {
                let message = "Error trying to get metrics: "+error.message;
                let node = new Node(instance.app, instance.app);
                node.notices.push(new Notice(message, null, Severity.alert));
                region.addNode(node);
            });
    }
};

function getMetrics(address) {
    return axios.get(address, {
        headers: {'Content-type': 'application/json'},
        timeout: 3000
    }).then(response => {
        return response.data
    });
}

module.exports = metrics;
