const config = require('../../configuration').get();
const Connection = require('./connection');
const Notice = require('./notice');
const Severity = require("./severity");

class ConnectionStore {
    constructor() {
        this.connections = [];
        this.addConnection = function (source, target, normal, warning, danger, metadata) {

            let notices = [];

            if (danger > 0) {
                notices.push(new Notice('Sucess: ' + normal, null, Severity.danger));
                notices.push(new Notice('Errors: ' + danger, null, Severity.danger));
            } else {
                let totalRequest = normal + warning;

                if (totalRequest >= config.vizceral.infoAtRequestCount) {
                    notices.push(new Notice('Total requests: ' + totalRequest, null, Severity.info));
                } else if (totalRequest >= config.vizceral.alertAtRequestCount) {
                    notices.push(new Notice('Total requests: ' + totalRequest, null, Severity.alert));
                }
            }

            let connection = new Connection(source, target, normal, warning, danger, notices, metadata);
            this.connections.push(connection);
        }
    }
}

module.exports = ConnectionStore;
