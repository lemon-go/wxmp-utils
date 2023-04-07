// --------------------------------------------
// 中间件模式，用于自定义扩展其他任何组件或流程。
// 组件执行顺序参考 Koa 的组件实现方式（洋葱模型）和微任务的执行顺序，
// 参考资料：
// Koa: https://www.koajs.com.cn
// Microtask: https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth
// 例子如下：
// compose([
//   function(c, n) { new Promise((r) =>{ console.log(1); r(n()) }).then(() => { console.log(2) }); },
//   function(c, n) { new Promise((r) =>{ console.log(3); r(n()) }).then(() => { console.log(4) }); },
//   function(c, n) { new Promise((r) =>{ console.log(5); r(n()) }).then(() => { console.log(6) }); },
// ])()；
// // 打印顺序：1, 3, 5, 6, 4, 2
//
// @author: YuanYou
// --------------------------------------------

export default class Middleware<T = any> {
  private middlewares: MiddlewareFn<T>[];
  private changed = false;
  private executor?: (context: T, endMiddleware?: MiddlewareFn<T>) => void;
  constructor() {
    this.middlewares = [];
  }

  /**
   * 注册中间件，相同的中间件中能被注册一次。
   * @param middleware 中间件函数
   */
  add(...middleware: MiddlewareFn<T>[]) {
    if (!middleware.length) return this;
    for (let i = 0; i < middleware.length;i++) {
      if (!this.middlewares.includes(middleware[i])) {
        this.middlewares.push(middleware[i]);
        !this.changed && (this.changed = true);
      }
    }
    // console.log('[Middlewares] length:' + this.middlewares.length, this.middlewares);
    return this;
  }

  /**
   * 移除已注册的中间件。
   * @param middleware 要移除的中间件
   */
  remove(middleware: MiddlewareFn<T>) {
    const i = this.middlewares.indexOf(middleware);
    if (i !== -1) {
      this.middlewares.splice(i, 1);
      this.changed = true;
    }
    return this;
  }

  /**
   * 清空所有已注册的中间件。
   */
  clear() {
    this.middlewares.splice(0);
    this.changed = true;
    return this;
  }

  /**
   * 获取中间件调用入口。
   */
  getExecutor() {
    if (this.changed || !this.executor) {
      this.executor = compose(this.middlewares);
      this.changed = false;
    }
    return this.executor;
  }
}

type NextMiddlewareDispatcher = () => Promise<any>;
export type MiddlewareFn<T = any> = (this: T, context: T, next: NextMiddlewareDispatcher) => Promise<any> | any;

function compose<T>(middlewares: MiddlewareFn<T>[]) {
  return function executor(context: T, endMiddleware?: MiddlewareFn<T>) {
    dispatch(0);
    function dispatch(i: number): Promise<any> {
      let fn = middlewares[i];
      if (i === middlewares.length && endMiddleware) {
        fn = endMiddleware;
      }
      if (!fn) {
        return Promise.resolve();
      }
      try {
        return Promise.resolve(fn.call(context, context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
}