// --------------------------------------------
// 数据类型验证，常用字符验证等。
// @author: YuanYou
// --------------------------------------------
const class2type: AnyObject = {};
(function() {
	const types = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error', 'Symbol'];
	types.forEach(type => {
		class2type["[object " + type + "]"] = type.toLowerCase();
	})
})();

type JsType = 'boolean' | 'number' | 'string' | 'function' | 'array' | 'date' | 'regexp' | 'object' | 'error' | 'symbol' | 'null' | 'undefined';

/**
 * 获取任意 JavaScript 对象的类型的字符串（小写）形式。
 * @param o
 */
export function type(o: any): JsType {
  return o === null ? String(o) : (class2type[{}.toString.call(o)] || 'object');
}

export function isFn(o: any): boolean {
	return type(o) === 'function';
}

export function isStr(o: any): boolean {
	return type(o) === 'string';
}

export function isNum(o: any): boolean {
	return type(o) === 'number';
}

export function isUndef(o: any): boolean {
	return type(o) === 'undefined';
}

export function isNull(o: any): boolean {
	return type(o) === 'null';
}

export function isBool(o: any): boolean {
	return type(o) === 'boolean';
}

export function isArr(o: any): boolean {
	return Array.isArray(o);
}

export function isObj(o: any): boolean {
	return type(o) === 'object';
}

export function isPlainObj(o: any): boolean {
	return (isObj(o) && Object.getPrototypeOf(o) === Object.prototype);
}

export function isEmptyObj(o: any): boolean {
  return isObj(o) && Object.getOwnPropertyNames(o).length === 0;
	// for (var p in o) {
	// 	if (p !== undefined) {
	// 		return false;
	// 	}
	// }
	// return true;
}

export function isErr(o: any): boolean {
	return type(o) === 'error';
}

export function isSymbol(o: any): boolean {
	return type(o) === 'symbol';
}

export function isIdCard(o: string) {
  return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(o + '');
}
