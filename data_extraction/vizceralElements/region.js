const config = require('../../configuration').get();
let NodeStore = require('./nodeStore');
let Node = require('./node');

class Region extends NodeStore {
    constructor(name, updated) {
        super();
        this.renderer = 'region';
        this.name = name.toLowerCase();
        this.maxVolume = 10000;
        this.updated = updated;

        this.addNode(new Node('internet', 'internet'));
        config.vizceral.entryNodes.forEach(entyNode => {
            this.addConnection('internet', entyNode, 0, 0, 0, null);
        });
    }
}

module.exports = Region;
