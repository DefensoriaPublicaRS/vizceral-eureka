class Notice {
    constructor(title, link, severity, metadata) {
        this.title = title;
        this.link = link || "";
        this.severity = severity || 0;
        this.metadata = metadata || {};

        this.copy = function () {
            return new Notice(this.title, this.link, this.severity, this.metadata);
        }
    }
}

module.exports = Notice;
