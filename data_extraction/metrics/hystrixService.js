let _ = require('underscore');

class HystrixService {
    constructor(name) {
        this.name = name;
        this.targets = [];

        this.addTarget = function(target){

            let existingTarget = this.getTarget(target);
            if(existingTarget){
                target.methods.forEach(method =>{
                    existingTarget.addMethod(method);
                });
            }else{
                this.targets.push(target);
            }
        };

        this.getTarget = function (target) {
            return _.find(this.targets, item => {
                return item.name === target.name;
            });
        };
    }
}

module.exports = HystrixService;
