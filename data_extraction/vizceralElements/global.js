let Region = require('./region');
let NodeStore = require('./nodeStore');

class Global extends NodeStore{
    constructor() {
        super();
        this.renderer = 'global';
        this.name = 'edge';
        this.maxVolume = 100000;
        this.entryNome = 'INTERNET';

        this.addNode(new Region(this.entryNome, null));
    }
}

module.exports = Global;
