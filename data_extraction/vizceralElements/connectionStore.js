let Connection = require('./connection');

class ConnectionStore {
    constructor() {
        this.connections = [];
        this.addConnection = function (source, target, normal, warning, danger, metadata) {
            connection = new Connection(source, target, normal, warning, danger, metadata);
            this.connections.push(connection);
        }
    }
}

module.exports = ConnectionStore;
