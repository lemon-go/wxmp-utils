// --------------------------------------------
// 用于编码、解码对象类型的 URL 查询参数。
// @behavior
// @author YuanYou
// --------------------------------------------

const encodeParamName = '_p_';

/**
 * 将指定的参数进行编码，并可选择后缀到指定URL后。
 * @param urlOrObj 需要跳转的目标URL或需要编码的参数
 * @param obj 需要后缀到目标URL的参数
 * @example
 * ```js
 * queryString(888) === '888'                 // true
 * queryString([888]) === '%5B888%5D'         // true
 * queryString('a/b', 888) === 'a/b?_p_=888'  // true
 * queryString('a/b?p1=p1', 888) === 'a/b?p1=p1&_p_=888' //true
 * ```
 */
export function queryString(urlOrObj: any, obj?: any): string {
  const args = arguments.length;
  if (args === 0) return '';
  if (args === 1) {
    return encodeURIComponent(JSON.stringify(urlOrObj))
  }
  const url = urlOrObj + ''
  const prefix = url.indexOf('?') !== -1 ? '&' : '?';
  return url + prefix + `${encodeParamName}=${encodeURIComponent(JSON.stringify(obj))}`;
}

/**
 * 将被经过编码的查询字符串或页面生命周期`onLoad`的参数转换为可使用的对象。
 * @param p
 * ```js
 * queryString.parse('%5B888%5D') // [888]
 * queryString.parse(888)         // 888
 * queryString.parse({_p_: "%7B%22age%22%3A18%7D"}) // {age:18}
 * ```
 */
queryString.parse = function<T = any>(p: string | PageOnLoadQuery): T | undefined {
  if (typeof p === 'string') {
    return JSON.parse(decodeURIComponent(p));
  } else {
    if (p !== null && p !== undefined) {
      if (p.constructor.name === 'Object' && Object.prototype.hasOwnProperty.call(p, encodeParamName)) {
        const wrapJSON = p[encodeParamName] as string;
        return queryString.parse(wrapJSON);
      }
      return p as any as T; // Not a string
    }
    // undefined
    return;
  }
}

/**
 * 同`queryString.parse`。将被经过编码的查询字符串或页面生命周期`onLoad`的参数转换为可使用的对象。
 * @param p
 * ```js
 * queryString.parse('%5B888%5D') // [888]
 * queryString.parse(888)         // 888
 * queryString.parse({_p_: "%7B%22age%22%3A18%7D"}) // {age:18}
 * ```
 */
export const parseQueryString = queryString.parse;

type PageOnLoadQuery = Record<string, string | undefined>;
