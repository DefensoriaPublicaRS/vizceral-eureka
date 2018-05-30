class Connection {
    constructor(source, target, normal, warning, danger, metadata) {
        this.source = source;
        this.target = target;
        this.metrics = {normal, warning, danger};
        this.metadata = metadata;
    }
}

module.exports = Connection;
