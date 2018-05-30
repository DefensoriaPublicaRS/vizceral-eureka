class Node {
    constructor(name, displayName, notices, metadata) {
        this.name = name;
        this.instances = 1;
        this.displayName = displayName;
        this.notices = notices || [];
        this.class = 'normal';
        this.metadata = metadata || [];

        this.addNewInstance = function (node) {
            this.instances += node.instances;
            this.notices = this.notices.concat(node.instances);
            this.metadata = this.metadata.concat(node.metadata);
        }
    }
}

module.exports = Node;
