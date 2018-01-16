const axios = require("axios");
var _ = require('underscore');

var metrics = {
        getMetrics: function(address){
            return axios.get(address + '/metrics', {
                    headers: {'Content-type': 'application/json'},
                    timeout: 3000
                }).then(response => {return response.data});
        },

        getSuccessFailureByService: function(address){
            return this.getMetrics(address).then(res => {
                var metrics =  _(res).pick((value, key) => {
                    var last = _(key.split('.')).last();
                    return (last === 'errorcount' || last === 'requestcount' );
                })

                var aggregate = {requestcount:0,errorcount:0, targets:{}};

                _(metrics).each((value, key) => {
                    var splitkey =  key.split('.');
                    var service;
                    var method;
                    if (splitkey[4] === 'ribboncommand'){
                        service = splitkey[5];
                        method = splitkey[4];
                    }else{
                        service = splitkey[4];
                        method = splitkey[5];
                    }


                    if (!aggregate.targets[service]){
                        aggregate.targets[service] = {errorcount:0,requestcount:0}
                    }
                    if (!aggregate.targets[service][method]){
                        aggregate.targets[service][method] = {errorcount:0,requestcount:0}
                    }
                    if (splitkey[6] === 'requestcount' ){
                        aggregate.requestcount += value;
                        aggregate.targets[service].requestcount += value;
                        aggregate.targets[service][method].requestcount += value;
                    }else{
                        aggregate.errorcount += value;
                        aggregate.targets[service].errorcount += value;
                        aggregate.targets[service][method].errorcount += value;
                    }
                })

                return aggregate;
            });
        }
};

module.exports = metrics;
