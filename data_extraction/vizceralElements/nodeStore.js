let ConnectionStore = require('./connectionStore');
let _ = require('underscore');

class NodeStore extends ConnectionStore {
    constructor() {
        super();
        this.nodes = [];
        this.addNode = function (node) {
            let existingNode = this.getNodeByName(node.name);
            if (existingNode) {
                existingNode.addNewInstance(node);
            } else {
                this.nodes.push(node);
            }
        };
        this.getNodeByName = function (name) {
            return _.find(this.nodes, item => {
                return item.name === name;
            });
        }
    }
}

module.exports = NodeStore;
