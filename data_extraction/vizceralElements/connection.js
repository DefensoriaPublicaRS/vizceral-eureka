const config = require('../../configuration').get();
const Notice = require('./notice');
const Severity = require("./severity");

class Connection {
    constructor(source, target, normal, warning, danger, notices, metadata) {
        this.source = source.toLowerCase();
        this.target = target.toLowerCase();
        this.metrics = {normal, warning, danger};
        this.metadata = metadata;
        this.notices = notices || [];

        if (danger > 0) {
            this.notices.push(new Notice('Sucess: ' + normal, null, Severity.danger));
            this.notices.push(new Notice('Errors: ' + danger, null, Severity.danger));
        } else {
            let totalRequest = normal + warning;

            if (totalRequest >= config.vizceral.infoAtRequestCount) {
                this.notices.push(new Notice('Total requests: ' + totalRequest, null, Severity.info));
            } else if (totalRequest >= config.vizceral.alertAtRequestCount) {
                this.notices.push(new Notice('Total requests: ' + totalRequest, null, Severity.alert));
            }
        }

    }
}

module.exports = Connection;
