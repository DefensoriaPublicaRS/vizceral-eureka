let Region = require('./region');
let NodeStore = require('./nodeStore');

class Global extends NodeStore{
    constructor() {
        super();
        this.renderer = 'global';
        this.name = 'edge';
        this.maxVolume = 100000;
        this.entryNode = 'internet';

        this.addNode(new Region(this.entryNode, null));
    }
}

module.exports = Global;
