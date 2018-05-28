let _ = require('underscore');
let config = require('../configuration').get();

function isNode(graph, serviceId) {
    return !!_(graph.nodes).findWhere({name: serviceId});
}

function convertToVizceral(rawData) {
    let data = {
        name: 'us-west-2',
        renderer: 'region',
        maxVolume: 10000,
        connections: []
    };

    data.nodes = _(rawData).map(function (value, key) {
        let notices = [];
        let qtdInstancias = Object.keys(value.instancias).length;
        let displayName = key;

        if (qtdInstancias > 1) {
            displayName = "(" + qtdInstancias + ")" + key;
            _(value.instancias).each(function (instancia, key) {
                notices.push({
                    title: instancia.requestcount + ": " + key,
                    severity: (instancia.errorcount > 1) ? 2 : 0
                });
            });
        }
        return {name: key, displayName: displayName, notices: notices};
    });

    data.nodes.push({
        name: 'INTERNET'
    });

    _(rawData).each(function (value, key) {
        _(value.targets).each(function (targetValue, targetKey) {

            let successCount = targetValue.requestcount - targetValue.errorcount;

            let connections = {
                source: key, target: targetKey,
                metrics: {
                    normal: successCount,
                    danger: targetValue.errorcount
                },
                metadata: {streaming: true}
            };

            if(targetValue.errorcount > 0){
                connections.notices = [{
                    title: 'Success: ' + successCount,
                    severity: config.vizceral.severity.danger
                }, {
                    title: 'Errors: ' + targetValue.errorcount,
                    severity: config.vizceral.severity.danger
                }]
            }else {
                let severity = (targetValue.requestcount >= config.vizceral.alertAtRequestCount) ?
                    config.vizceral.severity.alert : config.vizceral.severity.info;

                if (targetValue.requestcount >= config.vizceral.infoAtRequestCount) {
                    connections.notices = [{
                        title: 'Total requests: ' + targetValue.requestcount,
                        severity: severity
                    }]
                }
            }

            data.connections.push(connections);
            if (!isNode(data, targetKey)) {
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

module.exports = {
    convert: convertToVizceral
};
