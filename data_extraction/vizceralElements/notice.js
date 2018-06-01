class Notice {
    constructor(title, link, severity) {
        this.title = title;
        this.link = link || "";
        this.severity = severity || 0;

        this.copy = function () {
            return new Notice(this.title, this.link, this.severity);
        }
    }
}

module.exports = Notice;
