const config = require('../../configuration').get();
let Region = require('./region');
let NodeStore = require('./nodeStore');

class Global extends NodeStore{
    constructor() {
        super();
        this.renderer = 'global';
        this.name = 'edge';
        this.maxVolume = 100000;
        this.entryNode = config.vizceral.globalEntry;

        this.addNode(new Region(this.entryNode));
    }
}

module.exports = Global;
