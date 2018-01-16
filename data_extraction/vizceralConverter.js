let _ = require('underscore');
let config = require('../configuration').get();

function isNode(graph, serviceId) {
    return !!_(graph.nodes).findWhere({name: serviceId});
}

function convertToVizceral(rawData) {
    var data = {
        name: 'us-west-2',
        renderer: 'region',
        maxVolume: 10000,
        connections: []
    };

    data.nodes = _(rawData).map(function(value, key) {
        var notices = [];
        var qtdInstancias = Object.keys(value.instancias).length;
        var displayName = key;

        if(qtdInstancias > 1) {
            displayName = "(" + qtdInstancias + ")" + key;
            _(value.instancias).each(function(instancia, key) {
                notices.push({
                    title: getSpan(instancia.requestcount, false) + " | " + getSpan(instancia.errorcount, true) + " " + key,
                    severity: (instancia.errorcount > 1) ? 2 : 0
                });
            });
        }
        return {name: key, displayName: displayName, notices: notices};
    });

    data.nodes.push({
        name: 'INTERNET'
    });

    _(rawData).each(function(value, key) {
        _(value.targets).each(function(targetValue, targetKey) {
            var connections = {
                source: key, target: targetKey,
                metrics: {
                    normal: targetValue.requestcount,
                    danger: targetValue.errorcount
                },

                metadata: {streaming: true}
            };

            var totalRequests = targetValue.requestcount + targetValue.errorcount;

            var severity = (totalRequests >= config.vizceral.alertAtRequestCount) ?
                config.vizceral.severity.alert : config.vizceral.severity.info;

            if(targetValue.errorcount > 0) {
                severity = config.vizceral.severity.danger;
            }

            if(totalRequests >= config.vizceral.infoAtRequestCount || severity === config.vizceral.severity.danger) {
                connections.notices = [{
                    title: 'requestcount: ' + targetValue.requestcount + ', errorcount: ' + targetValue.errorcount,
                    severity: severity
                }]
            }
            data.connections.push(connections);
            if(!isNode(data, targetKey)) {
                data.nodes.push({name: targetKey})
            }
        })

    });

    data.connections.push({
        source: 'INTERNET', target: 'portal-defensoria-gateway'
    });


    data.connections.push({
        source: 'INTERNET', target: 'portal-defensoria'
    });

    return data;
}

function getSpan(text, erro) {
    return "<span style='color: " + (erro ? "red" : "blue") + "'>" + text + "</span>";
}

module.exports = {
    convert: convertToVizceral
};
