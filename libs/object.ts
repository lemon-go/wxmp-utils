// --------------------------------------------
// 数据类型操作。
// @author: YuanYou
// --------------------------------------------

import { isFn, isArr, isPlainObj } from './validation';

/**
 * 深拷贝合并对象。
 * @param deep 是否深拷贝
 * @param target 合并的目标对象
 * @param source 合并源对象
 */
export function extend<T, U>(deep: boolean, target: T, source: U): T & U;
/**
 * 合并对象
 * @param target 合并的目标对象
 * @param source 合并源对象
 */
export function extend<T, U>(target: T, source: U): T & U;

export function extend<T, U, V>(deep: boolean, target: T, source1: U, source2: V): T & U & V;
export function extend<T, U, V>(target: T, source1: U, source2: V): T & U & V;

export function extend<T, U, V, W>(deep: boolean, target: T, source1: U, source2: V, source3: W): T & U & V & W;
export function extend<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
export function extend(...args: any[]): any;
export function extend() {
  var options, name, src, copy, copyIsArray, clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;

  if (typeof target === "boolean") {
    deep = target;

    target = arguments[i] || {};
    i++;
  }

  if (typeof target !== "object" && !isFn(target)) {
    target = {};
  }

  if (i === length) {
    // [INFO] 在 jQuery 中，this 指向 jQuery 对象，
    // target = this;
    target = {};
    i--;
  }

  for (; i < length; i++) {
    if ((options = arguments[i]) != null) {
      for (name in options) {
        src = target[name];
        copy = options[name];

        if (target === copy) {
            continue;
        }

        if (deep && copy && (isPlainObj(copy) || (copyIsArray = isArr(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && isArr(src) ? src : [];

          } else {
            clone = src && isPlainObj(src) ? src : {};
          }

          target[name] = extend(deep, clone, copy);

        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }

  return target;
}

/** 将数组去重，并返回一个新的数组。 */
export function unique<T = any>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
