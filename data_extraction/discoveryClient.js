const axios = require("axios");
let configuration = require('../configuration').get();
const cloudConfigClient = require("cloud-config-client");

let applications = [];

console.log('Getting configuration for ' + configuration.application + ". Profiles: " + configuration.profiles);
cloudConfigClient.load(configuration).then(config => {
    setInterval(getApplicationsFromEureka, 60 * 1000, config);
    getApplicationsFromEureka(config);
});

function getApplicationsFromEureka(config) {

    eurekaUrl = config.get('eureka.client.serviceUrl.defaultZone') + 'apps';
    console.log("Updating application list from -> ", eurekaUrl);

    return axios.get(eurekaUrl, {headers: {'Content-type': 'application/json'}})
        .then(response => {
            applications = response.data.applications.application;
        })
        .catch(err => {
            console.error("Couldn't get new applications from Eureka: ", err);
        });
}

module.exports = {
    getApplicationList: function () {
        return applications;
    }
};
