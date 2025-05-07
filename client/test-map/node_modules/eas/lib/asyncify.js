/**
 * 模板异步处理
 *
 * @param {Function} executor
 * @constructor
 */
function Asyncify(executor) {
  this.resolve = () => {};
  this.reject = () => {};

  this.execute = function(...args) {
    executor(...args, (err, result) => {
      if (err) this.reject(err);
      else this.resolve(result);
    });
  };

  Object.defineProperty(this, '__async', {
    configurable: false,
    enumerable: false,
    value: true
  });
}

module.exports = Asyncify;
