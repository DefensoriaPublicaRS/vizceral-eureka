let ConnectionStore = require('./connectionStore');

class NodeStore extends ConnectionStore{
    constructor() {
        super();
        this.nodes = [];
        this.addNode = function (node) {
            this.nodes.push(node);
        }
    }
}

module.exports = NodeStore;
