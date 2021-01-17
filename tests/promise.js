const PromiseTS = require('../lib/index');

PromiseTS.defer = PromiseTS.deferred = function () {
    let dfd = {};

    dfd.promise = new PromiseTS((resolve, reject) => {
        dfd.resolve = resolve;
        dfd.reject = reject;
    })

    return dfd;
}