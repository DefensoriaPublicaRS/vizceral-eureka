class Notice {
    constructor(title, link, severity) {
        this.title = title;
        this.link = link || "";
        this.severity = severity || 1;
    }
}

module.exports = Notice;
