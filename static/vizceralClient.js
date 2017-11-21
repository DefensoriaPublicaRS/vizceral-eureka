function run () {
    var viz = new Vizceral.default(document.getElementById('vizceral'));
    viz.setView();
    viz.animate();

    function updateData(){
        fetch('/graph').then(function(res){
            res.json().then(function(data){
                viz.updateData(convertToVizceral(data))
            });
        });
        setTimeout(updateData,5000)
    }

    updateData();
}

function isNode(graph,serviceId){
    return !!_(graph.nodes).findWhere({name:serviceId});
}

function convertToVizceral(rawData){
    var data = {
        name: 'us-west-2',
        renderer: 'region',
        maxVolume: 10000,
        connections: []
    };

    data.nodes = _(rawData).map(function(value,key){
        return {name:key};
    });

    data.nodes.push({
        name:'INTERNET'
    });

    _(rawData).each(function(value,key){
        _(value.targets).each(function(targetValue,targetKey){
            var connections = {source:key, target:targetKey,
                metrics: {
                    normal:targetValue.requestcount ,
                    danger:targetValue.errorcount
                },

                metadata: { streaming: true }
            };

            var totalRequests = targetValue.requestcount + targetValue.errorcount;

            var severity = 0;
            if (targetValue.errorcount > 0){
                severity = 2;
            }

            if (severity === 0){
                if (totalRequests > 30 ){
                    severity = 1;
                }
            }

            if (totalRequests > 8 || severity > 0){
                connections.notices = [{
                    title:'requestcount: ' + targetValue.requestcount + ', errorcount: ' + targetValue.errorcount,
                    severity: severity
                }]
            }
            data.connections.push( connections );
            if (!isNode(data,targetKey)){
                data.nodes.push({name:targetKey})
            }
        })

    });

    data.connections.push({
        source:'INTERNET', target:'portal-defensoria-gateway'
    });


    data.connections.push({
        source:'INTERNET', target:'portal-defensoria'
    });

    return data;
}
