let NodeStore = require('./nodeStore');

class Region extends NodeStore{
    constructor(name, updated) {
        super();
        this.renderer = 'region';
        this.name = name;
        this.maxVolume = 10000;
        this.updated = updated;
    }
}

module.exports = Region;
