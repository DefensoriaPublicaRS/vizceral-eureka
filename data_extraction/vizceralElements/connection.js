class Connection {
    constructor(source, target, normal, warning, danger, notices, metadata) {
        this.source = source.toLowerCase();
        this.target = target.toLowerCase();
        this.metrics = {normal, warning, danger};
        this.metadata = metadata;
        this.notices = notices || [];
    }
}

module.exports = Connection;
