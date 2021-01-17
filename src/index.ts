const PROMISE_STATUS = {
    PENDING: 'PENDING',
    FULFILLED: 'FULFILLED',
    REJECTED: 'REJECTED'
}

type xType = Record<string, any> | null | Function | PromiseTS;

const resolvePromise = (
    promise2: PromiseTS,
    x: xType,
    resolve: Function,
    reject: Function
) => {
    if (promise2 === x) {
        return reject(new TypeError('recycled Promise'))
    }

    let hasCalledFn = false

    if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        try {
            const then = (x as { then: any }).then

            if (typeof then === 'function') {
                then.call(x, (y: xType) => {
                    if (hasCalledFn) return
                    hasCalledFn = true

                    resolvePromise(promise2, y, resolve, reject)
                }, (reason: xType) => {
                    if (hasCalledFn) return
                    hasCalledFn = true

                    reject(reason)
                })
            } else {
                resolve(x)
            }
        } catch (err) {
            if (hasCalledFn) return
            hasCalledFn = true

            reject(err)
        }
    } else {
        resolve(x)
    }
}

class PromiseTS {
    private status = PROMISE_STATUS.PENDING;

    private value = undefined;
    private reason = undefined;

    private onFulfilledQueue: Array<Function> = [];
    private onRejectedQueue: Array<Function> = [];

    constructor(executor: Function) {
        const resolve = (value: any) => {
            if (this.status === PROMISE_STATUS.PENDING) {
                this.status = PROMISE_STATUS.FULFILLED
                this.value = value
                this.onFulfilledQueue.forEach(fn => fn())
            }
        }

        const reject = (reason: any) => {
            if (this.status === PROMISE_STATUS.PENDING) {
                this.status = PROMISE_STATUS.REJECTED
                this.reason = reason
                this.onRejectedQueue.forEach(fn => fn())
            }
        }

        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }

    /**
     * then
     * @param {Function} onFulfilled 成功时调用
     * @param {Function} onRejected 拒绝时调用
     */
    public then(onFulfilled: Function, onRejected: Function): PromiseTS {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (v: any) => v
        onRejected = typeof onRejected === 'function' ? onRejected : (reason: any) => {
            throw reason
        }

        const promise2 = new PromiseTS((resolve: Function, reject: Function) => {
            if (this.status === PROMISE_STATUS.FULFILLED) {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (err) {
                        reject(err)
                    }
                }, 0)
            }

            if (this.status === PROMISE_STATUS.REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason)

                        resolvePromise(promise2, x, resolve, reject)
                    } catch (err) {
                        reject(err)
                    }
                }, 0)
            }

            if (this.status === PROMISE_STATUS.PENDING) {

                // 如果 promise 状态是 pending，需要将两种情况都存到队列中
                this.onFulfilledQueue.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (err) {
                            reject(err)
                        }
                    }, 0)
                })

                this.onRejectedQueue.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(this.reason)

                            resolvePromise(promise2, x, resolve, reject)
                        } catch (err) {
                            reject(err)
                        }
                    }, 0)
                })
            }
        })

        return promise2
    }
}

module.exports = PromiseTS