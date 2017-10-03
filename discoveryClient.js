const axios = require("axios");

var discoveryClient = function( myInfo,  config) {
    return {
        getApplications: function(){
            eurekaUrl = config.get('eureka.client.serviceUrl.defaultZone');
            console.log(eurekaUrl+  'apps');
            return axios.get(eurekaUrl+  'apps', {headers: {'Content-type': 'application/json'}});
            .then(response => { return response.data.applications.application});
        }
    }
}

module.exports = discoveryClient;
