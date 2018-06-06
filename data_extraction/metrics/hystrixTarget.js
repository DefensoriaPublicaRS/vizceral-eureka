let _ = require('underscore');

class HystrixTarget {
    constructor(name) {
        this.name = name;
        this.methods = [];
        this.requestCount = 0;
        this.errorCount = 0;
        this.latency = 0;

        this.addMethod = function (method) {

            let existingMethod = this.getMethod(method);
            if (existingMethod) {
                existingMethod.requestCount += method.requestCount;
                existingMethod.errorCount += method.errorCount;
                existingMethod.latency += Math.max(method.latency, existingMethod.latency);
            } else {
                this.methods.push(method);
            }

            this.requestCount += method.requestCount;
            this.errorCount += method.errorCount;
            this.latency += Math.max(method.latency, this.latency);
        };

        this.getMethod = function (method) {
            return _.find(this.methods, item => {
                return item.method === method.method;
            });
        };
    }

}

module.exports = HystrixTarget;
