// --------------------------------------------
// 拦截器。
// 一个函数的处理结果将作为下一个拦截器处理函数的入参。
// @author: YuanYou
// --------------------------------------------

type InterceptorHandler<T, V> = (p: T) => V;

export default class Interceptor<TArg = any, TResult = TArg> {
  private handlers?: Array<InterceptorHandler<any, any> | null>;

  /**
   * 添加拦截器。
   * 返回当前拦截器的id，可以用此来移除当前拦截器。
   * @param handler 拦截器函数
   */
  public add<T = TArg, V = any>(handler: InterceptorHandler<T, V>): number {
    const fns = this.handlers || (this.handlers = []);
    return fns.push(handler) - 1;
  }

  /**
   * 移除指定拦截器。
   * @param index 拦截器id
   */
  public remove(index: number): void;
  /**
   * 移除指定拦截器。
   * @param handler 注册的拦截器函数
   */
  public remove<T, V>(handler: InterceptorHandler<T, V>): void;
  public remove<T, V>(handlerOrIndex: number | InterceptorHandler<T, V>) {
    if (!this.handlers) return;
    if (typeof handlerOrIndex === 'number') {
      if (handlerOrIndex < this.handlers.length) {
        this.handlers[handlerOrIndex] = null;
      }
    } else {
      for (let i = 0; i < this.handlers.length; i++) {
        if (this.handlers[i] === handlerOrIndex) {
          this.handlers[i] = null;
        }
      }
    }
  }

  /**
   * 按照注册的顺序执行拦截器逻辑，上一个拦截器函数的返回值将作为下一个拦截器的入参，
   * 如果上一个没有返回值，则下一个拦截器的入参将和上一个入参一样。
   * @param p 第一个拦截器的入参
   */
  public invoke<T = TArg>(p: T): TResult {
    const fns = this.handlers || [];
    const dispatch = function(i: number, arg: any): any {
      if (i >= fns.length) return arg;
      const handler = fns[i];
      let handlerReturnValue = arg;
      if (handler) {
        handlerReturnValue = handler(arg);
        if (typeof handlerReturnValue === 'undefined') {
          handlerReturnValue = arg;
        }
      }
      return dispatch(++i, handlerReturnValue);
    };
    return dispatch(0, p);
  }
}