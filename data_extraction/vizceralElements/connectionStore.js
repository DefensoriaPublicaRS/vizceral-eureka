let _ = require('underscore');

class ConnectionStore {
    constructor() {
        this.connections = [];
        this.addConnection = function (connection) {
            let existingConnection = this.getConnection(connection.source, connection.target);
            if (existingConnection) {

                this.connections.splice(this.connections.indexOf(existingConnection),1);

                existingConnection.metrics.normal += connection.metrics.normal;
                existingConnection.metrics.warning += connection.metrics.warning;
                existingConnection.metrics.danger += connection.metrics.danger;
                existingConnection.notices = existingConnection.notices.concat(connection.notices);

                this.connections.push(existingConnection.copy());

            } else {
                this.connections.push(connection);
            }
        };

        this.getConnection = function (source, target) {
            return _.findWhere(this.connections, {source: source, target: target});
        };

        this.countRequests = function () {
            let counter = {normal: 0, warning: 0, danger: 0};
            this.connections.forEach(connection => {
                counter.normal += connection.metrics.normal;
                counter.warning += connection.metrics.warning;
                counter.danger += connection.metrics.danger;
            });
            return counter;
        }
    }
}

module.exports = ConnectionStore;
