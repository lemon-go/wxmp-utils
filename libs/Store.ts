// --------------------------------------------
// 数据存储管理器。
// @author: YuanYou
// --------------------------------------------

import { queueMicrotask } from "./task";

/** 数据存储管理器。 */
export default class Store<S extends StoreBase = StoreBase, OptionalProp extends boolean = false> {
  private store = {} as (OptionalProp extends true ? Optional<S> : S);
  /** 存储器中能缓存键的最大个数，默认`0`不限制。 */
  private max = 0;
  /** 是否将数据自动存储到本地缓存`Storage`中，默认`false`。 */
  private storage = false;
  /** 缓存到本地缓存`Storage`中时使用的键值，设置了`storage`为`true`时，必须设置该属性。 */
  private storageKey?: string;
  /** 是否已启动了自动缓存任务。 */
  private loadStorageTask = false;

  constructor();
  constructor(options: IStoreOptions);
  constructor(options?: IStoreOptions) {
    if (options) {
      if (typeof options.max === 'number' && options.max >= 0) this.max = options.max;
      if (typeof options.storage === 'boolean') this.storage = options.storage;
      if (typeof options.storageKey === 'string') this.storageKey = options.storageKey;
    }
    if (this.storage) {
      if (!this.storageKey) {
        console.warn('[Store] 你设置了自动本地数据缓存，但没有设置缓存key，自动缓存将不会生效！');
      } else {
        try {
          this.store = wx.getStorageSync(this.storageKey) || {};
        } catch (error) {
          // do nothing  
        }
      }
    }
  }

  /** 获取存储器中存储的键值对数量。 */
  public get size() {
    return this.keys().length;
  }

  /** 存储对应键的值，并返回是否存储成功（但不保证本地缓存是否成功）。 */
  public set<P extends keyof S>(key: P, value: (OptionalProp extends true ? Optional<S> : S)[P]): boolean {
    if (this.max > 0 && this.size >= this.max) {
      return false;
    }
    this.store[key] = value;
    this._toLoadStorageTask();
    return true;
  }

  /** 获取整个数据存储区对象。 */
  public get(): OptionalProp extends true ? Optional<S> : S;
  /** 获取对应键的值。 */
  public get<P extends keyof S>(key: P): (OptionalProp extends true ? Optional<S> : S)[P];
  public get<P extends keyof S>(key?: P) {
    if (typeof key === 'undefined') return this.store;
    return this.store[key];
  }

  /** 从存储器中移除指定键及其值。 */
  public remove(key: keyof S) {
    delete this.store[key];
    if (this.exist(key)) {
      this._toLoadStorageTask();
    }
  }

  /** 清空存储器。 */
  public clear() {
    const reset = {} as (OptionalProp extends true ? Optional<S> : S);
    this.store = reset;
    this._toLoadStorageTask();
  }

  /** 存储器中是否存在指定的键。 */
  public exist(key: keyof S) {
    return Object.prototype.hasOwnProperty.call(this.store, key);
  }

  /** 存储器中是否存在指定的键，且存储有值(非`undefined`)。 */
  public existStrict(key: keyof S) {
    return this.exist(key) && typeof this.get(key) !== 'undefined';
  }

  /** 获取存储器中所有键的数组。 */
  public keys() {
    const symNames = Object.getOwnPropertySymbols(this.store);
    const strNames = Object.getOwnPropertyNames(this.store);
    return [...symNames, ...strNames];
  }

  /** 获取存储器中所有值的数组。 */
  public values() {
    return Object.values<S[keyof S]>(this.store as S);
  }

  /** 创建一个数据存储器。 */
  public static create(): Store<StoreBase, false>;
  public static create(options: IStoreOptions): Store<StoreBase, false>;
  public static create<S extends StoreBase>(): Store<S, false>;
  public static create<S extends StoreBase>(options: IStoreOptions): Store<S, false>;
  public static create<S extends StoreBase, OptionalProp extends boolean>(): Store<S, OptionalProp>;
  public static create<S extends StoreBase, OptionalProp extends boolean>(options: IStoreOptions): Store<S, OptionalProp>;
  public static create<S extends StoreBase = StoreBase, OptionalProp extends boolean = false>(options?: IStoreOptions) {
    return new this(options!) as Store<S, OptionalProp>;
  }

  private _toLoadStorageTask() {
    const ctx = this;
    if (ctx.storage && ctx.storageKey && !ctx.loadStorageTask) {
      ctx.loadStorageTask = true;
      queueMicrotask(() => {
        wx.setStorage({ key: ctx.storageKey!, data: ctx.store });
        ctx.loadStorageTask = false;
      });
    }
  }
}

type StoreBase = Record<string | number | symbol, any>;
interface IStoreOptions {
  /** 存储器中能缓存键的最大个数，默认`0`不限制。 */
  max?: number;
  /** 是否将数据自动存储到本地缓存`Storage`中，默认`false`。[点击参考](https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.setStorage.html) */
  storage?: boolean;
  /** 缓存到本地缓存`Storage`中时使用的键值，设置了`storage`为`true`时，必须设置该属性。 */
  storageKey?: string;
}