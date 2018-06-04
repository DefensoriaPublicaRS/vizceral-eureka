const config = require('../../configuration').get();
const Notice = require('./notice');
const Severity = require("./severity");

class Connection {
    constructor(source, target, normal, warning, danger, notices, metadata) {
        this.source = source.toLowerCase();
        this.target = target.toLowerCase();
        this.metrics = {normal, warning, danger};
        this.metadata = metadata || {};
        this.notices = notices || [];

        let noticeMetadata = {type: 'request_count'};
        if (danger > 0) {
            this.notices.push(new Notice('Success: ' + normal, null, Severity.danger, noticeMetadata));
            this.notices.push(new Notice('Errors: ' + danger, null, Severity.danger, noticeMetadata));
        } else {
            let totalRequest = normal + warning;

            if (totalRequest >= config.vizceral.alertAtRequestCount) {
                this.notices.push(new Notice('Total requests: ' + totalRequest, null, Severity.alert, noticeMetadata));
            } else if (totalRequest >= config.vizceral.infoAtRequestCount) {
                this.notices.push(new Notice('Total requests: ' + totalRequest, null, Severity.info, noticeMetadata));
            }
        }

        this.copy = function () {
            let connection = new Connection(
                this.source,
                this.target,
                this.metrics.normal,
                this.metrics.warning,
                this.metrics.danger,
                null,
                null);

            this.notices.forEach(notice => {
                if (notice.metadata.type !== 'request_count') {
                    connection.notices.push(notice.copy());
                }
            });
            return connection;
        }
    }
}

module.exports = Connection;
