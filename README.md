# promise-ts
用TS实现符合 [PromiseA+](https://promisesaplus.com/) 规范的 promise

> 一个开放、健全且通用的 Promise 的标准，由开发者指定，刚开发者参考。

Promise 表示一个异步操作的最终结果，与之进行交互的方式主要是 then 方法，该方法注册了两个回调函数，用于接收 promise 的终值或本 promise 不能执行的原因。

本规范详细列出了 then 方法的执行过程，所有遵循 [PromiseA+](https://promisesaplus.com/) 规范实现的 promise 均可以本标准作为参照基础来实施 then 方法。因而本规范是十分稳定的。尽管 [PromiseA+](https://promisesaplus.com/) 组织有时可能会修订本规范，但主要是为了处理一些特殊的边界情况，且这些改动都是微小且向下兼容的。如果我们要进行大规模不兼容的更新，我们一定会在事先进行谨慎地考虑、详尽的探讨和严格的测试。

从历史上说，本规范实际上是把之前 [PromiseA+](https://promisesaplus.com/) 规范 中的建议明确成为了行为标准：我们一方面扩展了原有规范约定俗成的行为，一方面删减了原规范的一些特例情况和有问题的部分。

最后，核心的 [PromiseA+](https://promisesaplus.com/) 规范不设计如何创建、解决和拒绝 promise，而是专注于提供一个通用的 then 方法。上述对于 promises 的操作方法将来在其他规范中可能会提及。

## 1. 术语
### promise
是一个拥有 then 方法的对象或函数，其行为符合本规范；

### thenable
是一个定义了 then 方法的对象或函数；

### value
代表任何的 JavaScript 的合法值；

### exception
使用 throw 语句抛出的一个值；

### reason
表示 promise 的拒绝原因；

## 2. 要求
### 2.1 Promise States
一个 promise 必须是三种状态中的一种：pending、fulfilled 或者 rejected。

#### 2.1.1. 当处于 pending，promise 可以：
- 2.1.1.1. 可以转换成 fulfilled 或者 rejected 状态；

### 2.1.2. 当处于 fulfilled， promise 可以：
- 2.1.2.1. 不能转换成其他状态；
- 2.1.2.2. 必须拥有一个不可改变的终值；

### 2.1.3. 当处于 rejected， promise 可以：
- 2.1.3.1. 不能转换成其他状态；
- 2.1.3.2. 必须拥有一个不可改变的原因；

这里的不可变指的是恒等（即可用 **===** 判断相等），而不是意味着更深层次的不可变。

### 2.2 then 方法
一个 promise 必须提供一个 then 方法以访问其当前值、终值和据因。

一个 promise 的 then 方法接收两个参数：
```js
promise.then(onFulfilled, onRejected);
```

#### 2.2.1. onFulfilled 和 onRejected 都是可选参数：
- 2.2.1.1. 如果 onFulfilled 不是函数，它必须被忽略；
- 2.2.1.2. 如果 onRejected 不是函数，它必须被忽略；

#### 2.2.2. 如果 onFulfilled 是函数：
- 2.2.2.1. 当 promise 执行结束后其必须被调用，其第一个参数为 promise 的终值；
- 2.2.2.2. 在 promise 执行结束前其不可被调用；
- 2.2.2.3. 其调用次数不可超过一次；

#### 2.2.3. 如果 onRejected 是函数：
- 2.2.3.1. 当 promise 被拒绝执行后其必须被调用，其第一个参数为 promise 的原因；
- 2.2.3.2. 在 promise 被拒绝执行前其不可被调用；
- 2.2.3.3. 其调用次数不可超过一次；

#### 2.2.4. onFulfilled 和 onRejected 只有在执行环境堆栈仅包含平台代码时才可被调用；

#### 2.2.5. onFulfilled 和 onRejected 必须被作为函数调用（即没有 this 值）；

#### 2.2.6. then 方法可以被同一个 promise 调用多次；
- 2.2.6.1. 当 promise 成功执行时，所有 onFulfilled 需按照其注册顺序依次回调
- 2.2.6.2. 当 promise 被拒绝执行时，所有的 onRejected 需按照其注册顺序依次回调

#### 2.2.7. then 方法必须返回一个 promise 对象；
```js
promise2 = promise1.then(onFulfilled, onRejected);
```
- 2.2.7.1. 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程：[[Resolve]](promise2, x);
- 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e;
- 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
- 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的据因

### Promise 处理过程
**Promise 处理过程**是一个抽象的操作，其需输入一个 promise 和一个值，我们表示为 `[[Resolve]](promise, x)`，如果 x 有 then 方法且看上去像一个 Promise ，解决程序即尝试使 promise 接受 x 的状态；否则其用 x 的值来执行 promise 。

这种 thenable 的特性使得 Promise 的实现更具有通用性：只要其暴露出一个遵循 [PromiseA+](https://promisesaplus.com/) 协议的 then 方法即可；这同时也使遵循 [PromiseA+](https://promisesaplus.com/) 规范的实现可以与那些不太规范但可用的实现能良好共存。

运行 `[[Resolve]](promise, x)` 需遵循以下步骤：
### 2.3.1. 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise;

### 2.3.2. 如果 x 为 Promise ，则使 promise 接受 x 的状态：
- 2.3.2.1. 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝；
- 2.3.2.2. 如果 x 处于执行态，用相同的值执行 promise；
- 2.3.2.3. 如果 x 处于拒绝态，用相同的据因拒绝 promise；

### 2.3.3. 否则，如果 x 是一个对象或者函数；
- 2.3.3.1. 把 x.then 赋值给 then；
- 2.3.3.2. 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise；
- 2.3.3.3. 如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
  - 2.3.3.3.1. 如果 resolvePromise 以值 y 为参数被调用，则运行 `[[Resolve]](promise, y)`;
  - 2.3.3.3.2. 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise;
  - 2.3.3.3.3. 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略其他的调用;
  - 2.3.3.3.4. 如果调用 then 方法抛出了异常 e：
    - 2.3.3.3.4.1. 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之；
    - 2.3.3.3.4.2. 否则以 e 为据因拒绝 promise；
- 2.3.3.4. 如果 then 不是函数，以 x 为参数执行 promise；

### 2.3.4. 如果 x 不为对象或者函数，以 x 为参数执行 promise；

如果一个 promise 被一个循环的 thenable 链中的对象解决，而 `[[Resolve]](promise, thenable)` 的递归性质又使得其被再次调用，根据上述的算法将会陷入无限递归之中。算法虽不强制要求，但也鼓励施者检测这样的递归是否存在，若检测到存在则以一个可识别的 TypeError 为据因来拒绝 promise 。

## 3. 备注
- 3.1. 这里的”平台代码“指的是引擎、环境以及 promise 的实施代码。实践中要确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。这个事件队列可以采用“宏任务（macro-task）”机制（比如 `setTimeout` 或者 `setImmediate` ）或者“微任务（micro-task）”机制（比如 `MutationObersver` 或 `process.nextTick` ）来实现。由于 promise 的实施代码本身就是平台代码（译者注：即都是 JavaScript），故代码自身在处理程序时可能已经包含一个任务调度队列。

- 3.2. 在严格模式（strict）中，函数 this 的值为 undefined ；在非严格模式中其为全局对象。

- 3.3. 代码实现在满足所有要求的情况下可以允许 promise2 === promise1 。每个实现都要文档说明其是否允许以及在何种条件下允许 promise2 === promise1 。

- 3.4. 总体来说，如果 x 符合当前实现，我们才认为它是真正的 promise 。这一规则允许那些特例实现接受符合已知要求的 Promises 状态。

- 3.5. 这步我们先是存储了一个指向 x.then 的引用，然后测试并调用该引用，以避免多次访问 x.then 属性。这种预防措施确保了该属性的一致性，因为其值可能在检索调用时被改变。

- 3.6. 实现不应该对 thenable 链的深度设限，并假定超出本限制的递归就是无限循环。只有真正的循环递归才应能导致 TypeError 异常；如果一条无限长的链上 thenable 均不相同，那么递归下去永远是正确的行为。