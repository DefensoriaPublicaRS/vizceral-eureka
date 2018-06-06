class HystrixMethod {
    constructor(method) {
        this.method = method;
        this.requestCount =  0;
        this.errorCount =  0;
        this.latency =  0;
    }
}

module.exports = HystrixMethod;
