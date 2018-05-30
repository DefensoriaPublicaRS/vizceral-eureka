class Node {
    constructor(name, displayName) {
        this.name = name.toLowerCase();
        this.instances = 1;
        this.displayName = displayName.toLowerCase();
        this.notices = [];
        this.class = 'normal';
        this.metadata = [];

        this.addNewInstance = function (node) {
            this.instances += node.instances;
            this.displayName = "(" + this.instances + ")" + node.displayName;
            this.notices = this.notices.concat(node.notices);
            this.metadata = this.metadata.concat(node.metadata);
        }
    }
}

module.exports = Node;
