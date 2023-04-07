// --------------------------------------------
// 全局事件，用于跨多个页面之间的事件通信。
// @author: YuanYou
// --------------------------------------------

// import HandledError from "./error/HandledError";
import { queueMicrotask } from "./task";

/** 事件监听和派发。 */
export class EventScope {
  private listeners: EventListeners<any> = {};

  /**
   * 注册指定的事件及其回调。
   * @param type 事件名称
   * @param callback 回调函数
   * @returns 是否注册成功
   */
  public on(type: string, callback: EventCallback<any>): boolean;
  /**
   * 注册指定的事件及其回调，并可指定回调函数执行时的上下文。
   * @param type 事件名称
   * @param callback 回调函数
   * @param context 回调函数执行时的上下文
   * @returns 是否注册成功
   */
  public on<T = any>(type: string, callback: EventCallback<T>, context: T): boolean;
  public on<T = any>(type: string, callback: EventCallback<T>, context?: T): boolean {
    if (!type || !callback) return false;
    const evt = this.listeners[type] || (this.listeners[type] = []);
    if (evt.length && evt.some(e => e.callback === callback)) {
      // throw new HandledError();
      console.warn(`[EventScope] 事件“${type}”无法重复注册相同的回调函数(${callback.name})。`);
      return false;
    }
    evt.push({ callback, context });
    return true;
  }

  /**
   * 清除所有事件。
   * @returns 是否清除成功
   */
  public off(): boolean;
  /**
   * 注销事件（包括其所有的回调函数）。
   * @param type 事件名称
   * @returns 是否注销成功
   */
  public off(type: string): boolean;
  /**
   * 注销事件的指定回调函数。
   * @param type 事件名称
   * @param callback 回调函数
   * @returns 是否注销成功
   */
  public off(type: string, callback: EventCallback<any>): boolean;
  public off(type?: string, callback?: EventCallback<any>): boolean {
    const listeners = this.listeners;
    const noType = typeof type === 'undefined';
    const noCall = typeof callback === 'undefined';
    if (noType && noCall) {
      // 1.清除所有事件
      const eventNames = Object.keys(listeners);
      eventNames.forEach(name => {
        delete listeners[name];
      });
      return eventNames.length > 0;
    } else {
      const typ = type as string;
      const evt = listeners[typ];
      if (!evt || !evt.length) return false;
      if (callback) {
        // 2.移除事件的指定回调
        const i = evt.findIndex(e => e.callback === callback);
        if (i !== -1) {
          evt.splice(i, 1);
          return true;
        }
        return false;
      } else {
        // 3.移除指定事件及其所有回调
        return delete listeners[typ];
      }
    }
  }

  /**
   * 触发指定事件并传入自定义事件参数。
   * @param type 事件类型
   * @param args 自定义事件参数，将作为回调函数的入参
   */
  public emit(type: string, ...args: any[]): void {
    const evts = this.listeners[type];
    if (!evts || !evts.length) return;
    evts.forEach(evt => {
      evt.callback.apply(evt.context, args);
    });
  }

  /**
   * 注册一次指定的事件及其回调。
   * @param type 事件名称
   * @param callback 回调函数
   * @returns 是否注册成功
   */
  public once(type: string, callback: EventCallback<any>): boolean;
  /**
   * 注册一次指定的事件及其回调，并可指定回调函数执行时的上下文。
   * @param type 事件名称
   * @param callback 回调函数
   * @param context 回调函数执行时的上下文
   * @returns 是否注册成功
   */
  public once<T = any>(type: string, callback: EventCallback<T>, context: T): boolean;
  public once<T = any>(type: string, callback: EventCallback<T>, context?: T): boolean {
    const ctx = this;
    let handler = function () {
      // @ts-ignore-next-line
      callback.apply(this, [...arguments]);
      // 使用微任务移除一次性事件，防止在绑定多个事件的情况下，一边移除事件一边触发事件导致事件错位漏执行
      queueMicrotask(() => {
        ctx.off(type, handler);
        // @ts-ignore-next-line
        handler = undefined;
      });
    };
    return ctx.on(type, handler, context);
  }
}

/** 全局事件。 */
const globalEvent = new EventScope();

/**
 * 注册指定的事件及其回调。
 * @param type 事件名称
 * @param callback 回调函数
 * @returns 是否注册成功
 */
export function on(type: string, callback: EventCallback<any>): boolean;
/**
 * 注册指定的事件及其回调，并可指定回调函数执行时的上下文。
 * @param type 事件名称
 * @param callback 回调函数
 * @param context 回调函数执行时的上下文
 * @returns 是否注册成功
 */
export function on<T = any>(type: string, callback: EventCallback<T>, context: T): boolean;
/**
 * 注册指定的事件及其回调，并可指定回调函数执行时的上下文。
 * @param type 事件名称
 * @param callback 回调函数
 * @param context 回调函数执行时的上下文
 * @returns 是否注册成功
 */
export function on<T = any>(type: string, callback: EventCallback<T>, context?: T): boolean {
  return globalEvent.on(type, callback, context!);
}
/**
 * 清除所有事件。
 * @returns 是否清除成功
 */
export function off(): boolean;
/**
 * 注销事件（包括其所有的回调函数）。
 * @param type 事件名称
 * @returns 是否注销成功
 */
export function off(type: string): boolean;
/**
 * 注销事件的指定回调函数。
 * @param type 事件名称
 * @param callback 回调函数
 * @returns 是否注销成功
 */
export function off(type: string, callback: EventCallback<any>): boolean;
/**
 * 注销事件的指定回调函数。
 * @param type 事件名称
 * @param callback 回调函数
 * @returns 是否注销成功
 */
export function off(type?: string, callback?: EventCallback<any>): boolean {
  return globalEvent.off(type!, callback!);
}

/**
 * 触发指定事件并传入自定义事件参数。
 * @param type 事件类型
 * @param args 自定义事件参数，将作为回调函数的入参
 */
export function emit(type: string, ...args: any[]): void {
  return globalEvent.emit(type, ...args);
}

/**
 * 注册一次指定的事件及其回调。
 * @param type 事件名称
 * @param callback 回调函数
 * @returns 是否注册成功
 */
export function once(type: string, callback: EventCallback<any>): boolean;
/**
 * 注册一次指定的事件及其回调，并可指定回调函数执行时的上下文。
 * @param type 事件名称
 * @param callback 回调函数
 * @param context 回调函数执行时的上下文
 * @returns 是否注册成功
 */
export function once<T = any>(type: string, callback: EventCallback<T>, context: T): boolean;
export function once<T = any>(type: string, callback: EventCallback<T>, context?: T): boolean {
  return globalEvent.once(type, callback, context!);
}

type EventCallback<T> = (this: T, ...args: any[]) => any;
type EventOption<T> = { callback: EventCallback<T>, context: any };
type EventListeners<T> = Record<string, EventOption<T>[]>;
