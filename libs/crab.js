(function (window) {
    'use strict';

    /*
     ~ 导出：Model, Collection, View, event, util, validator, counter
     ~ （Crab中以大写字母开头的成员对象表示一个构造函数，一般需实例化后才可使用其实例成员【类属性（成员）除外】）
     ~
     ~ 问题：
     ~      1、Model, Collection, View成员中的 $parent 引用默认指向自身，是否解除
     ~
     ~
     ~
    **/
    var Crab = window.Crab = {};

    //(AJAX)=============================================================================
    /**
     * ajax 请求代理。
     * crab 默认不实现ajax请求的具体代码，若要使用请先设置此代理，如jQuery的$.ajax；
     * 此ajax代理函数的参数列表为：[ url{string}, ajaxSetting{object} ]
     */
    Crab.ajax = null;

    //(Util)=============================================================================
    var _class2type = {},
        _toString = _class2type.toString,
        _hasOwnProp = _class2type.hasOwnProperty,
        _splice = Array.prototype.splice,
        _slice = Array.prototype.slice,
        _filter = Array.prototype.filter,
        _map = Array.prototype.map,
        _each = Array.prototype.forEach,
        _sort = Array.prototype.sort,
        _isNullOrUndefined = function(value){
        	return (value === null || value === undefined);
        };
    for (var i = 0, _types = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error', 'Symbol']; i < _types.length; i++) {
        _class2type["[object " + _types[i] + "]"] = _types[i].toLowerCase();
    }
    var _isElement = typeof HTMLElement === 'object'
                ? function (e) { return (e instanceof HTMLElement); }
                : function (e) { return (e && typeof e === 'object' && e.nodeType === 1 && typeof e.nodeName === 'string'); };

    var util = Crab.util = {

        ////////////////////////// base
        /**
         * 判断一个对象的类型。
         * @param {*} obj - 要判断的js对象
         */
        type: function (obj) {
            if (obj === null) {
                return obj + '';
            }

            // Support: Android<4.0, iOS<6 (functionish RegExp)
            return (typeof obj === 'object' || typeof obj === 'function')
                ? _class2type[_toString.call(obj)] || 'object'
                : typeof obj;
        }
        /**
         * 抛出错误（异常）
         */
        , error: function (err) {
            throw new Error(err + '');
        }

        ////////////////////////// judge
        /**
         * 判断一个对象是否是窗口对象。
         */
        , isWindow: function (obj) {
            return obj !== null && obj === obj.window;
        }
        /**
         * 判断一个对象是否是纯粹的Object。(from jQuery)
         */
        , isPlainObject: function (obj) {
            var key;

            // Not plain objects:
            // - Any object or value whose internal [[Class]] property is not "[object Object]"
            // - DOM nodes
            // - window
            if (util.type(obj) !== "object" || obj.nodeType || util.isWindow(obj)) {
                return false;
            }

            // Not own constructor property must be Object
            if (obj.constructor &&
                    !_hasOwnProp.call(obj, "constructor") &&
                    !_hasOwnProp.call(obj.constructor.prototype || {}, "isPrototypeOf")) {
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own
            //for (key in obj) { }

            return key === undefined || _hasOwnProp.call(obj, key);
        }
        /**
         * 判断一个对象是否是空（Empty）对象（没有任何属性即为空）。
         * ...from jQuery
         */
        , isEmptyObject: function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        }
        /**
         * 判断一个对象是否是js函数对象。
         */
        , isFunction: function (fn) {
            return util.type(fn) === 'function';
        }
        /**
         * 判断一个对象是否是js数组对象。
         */
        , isArray: function (ar) {
            return Array.isArray(ar);
        }
        /**
         * 判断一个对象是否是由键值数据格式组成的对象。
         */
        , isObject: function (obj) {
            return (obj && typeof obj === 'object' && !util.isFunction(obj) && !util.isArray(obj) && !_isElement(obj));
        }
        /**
         * 判断一个对象是否是DOM对象。
         */
        , isElement: _isElement
        /**
         * 判断一个对象是否是字符串。
         */
        , isString: function (str) {
            return util.type(str) === 'string';
        }
        /**
         * 判断一个对象是否是数值类型；数字的字符串形式也视为数字，如 isNumeric("-2.7")返回 true。
         */
        , isNumeric: function (obj) {
            var realStringObj = obj && obj.toString();
            return !util.isArray(obj) && (realStringObj - parseFloat(realStringObj) + 1) >= 0;
        }

        ////////////////////////// array methods...
        /**
		 * 返回第一个通过predicate迭代函数真值检测的数组元素值，未找到返回undefined。
         * @param {array} arr - 要查找的数组
         * @param {function(item)} predicate - 真值检测函数
		 */
        , find: function (arr, predicate) {
            var _i = util.findIndex(arr, predicate);
            return (_i >= 0) ? arr[_i] : undefined;
        }
        /**
		 * 返回第一个通过predicate迭代函数真值检测的数组元素值的索引，没找到返回 -1。
         * @param {array} arr - 要查找的数组
         * @param {function(item)} predicate - 真值检测函数
		 */
		, findIndex: function (arr, predicate) {
		    var matchIndex = -1;
		    if (util.isArray(arr)) {
		        for (var i = 0; i < arr.length; i++) {
		            if (predicate(arr[i], i)) {
		                matchIndex = i;
		                break;
		            }
		        }
		    }
		    return matchIndex;
		}
        /**
         * 删除数组指定索引区间（前闭后开）之间的数组，返回删除成功的数组；
         * 如果不指定结束索引，则删除从开始索引至数组末尾的元素。
         * @param {array} arr - 原数组
         * @param {int} index - 要删除的数组元素的开始位置索引
         * @param {*int} indexEnd - 结束位置索引
         */
        , remove: function (arr, index, indexEnd) {
            var l = arguments.length;
            if (l < 2 || !util.isArray(arr)) return null;
            var al = arr.length, dels = (l > 2) ? indexEnd - index : al - index;

            if (index >= 0 && index < al)
                return _splice.call(arr, index, dels);
            else
                return null;
        }
        /**
		 * 删除数组指定位置的元素，并返回已删除的数组；
		 * 若 arr 不是数组或 index 超出范围，返回 null。
         * @param {array} arr - 原数组
         * @param {int} index - 要删除的数组元素的位置索引
		 */
		, removeAt: function (arr, index) {
		    if (arguments.length < 2) return null;
		    var r = util.remove(arr, index, index + 1);
		    if (r) return r[0];
		    return r;
		}
        /**
         * 去除数组中重复的元素。
         * 注意：目前只适用于筛选存储基本数据类型值的数组。
         * @param {array<number|string|boolean>} - 要筛选的数组
         */
        , uniq: function (arr) {
            var _result = [];
            if (util.isArray(arr)) {
                var _curr = null,
                    i = 0;
                for (; i < arr.length; i++) {
                    _curr = arr[i];
                    if (_result.length === 0 || _result.indexOf(_curr) < 0)
                        _result.push(_curr);
                }
            }
            return _result;
        }

        ////////////////////////// object methods...
        /**
         * 返回一个对象自身属性（hasOwnProperty）的名称数组。
         * @param {object} obj - 一个对象
         */
        , keys: function (obj) {
            if (!util.isObject(obj)) return [];
            return Object.keys(obj);
        }
        /**
         * 删除一个对象中指定的属性。
         * @param {object} obj - 对象
         * @param {array<string>} removes - 要删除的属性名称数组
         */
        , without: function (obj, removes) {
            if (arguments.length > 1) {
                var _o = obj;
                if (util.isObject(obj) && util.isArray(removes)) {
                    var r = '';
                    for (var i = 0; i < removes.length; i++) {
                        r = removes[i];
                        if (_hasOwnProp.call(_o, r)) delete _o[r];
                    }
                }
                return _o;
            } else {
                return obj;
            }
        }
        /**
         * 跟without相反，within返回一个对象中只包含includes数组中指定的属性名称的对象。
         * @param {object} obj - 原对象
         * @param {array} includes - 要包含的属性名称的数组
         */
        , within: function (obj, includes) {
            if (arguments.length > 1) {
                var _o = {}, _name = '';
                for (var i = 0; i < includes.length, _name = includes[i]; i++) {
                    if (_hasOwnProp.call(obj, _name)) _o[_name] = obj[_name];
                }

                return _o;
            } else {
                return obj;
            }
        }
        /**
         * 与within类似，区别在于第二个参数不是一个数组而是一个对象，
         * 当obj中的某个属性值为undefined时采用includes中的值。
         */
        , withinObject: function (obj, includes) {
            if (arguments.length > 1) {
                var _o = {}, _names = util.keys(includes), _name = '';
                for (var i = 0, l = _names.length; i < l; i++) {
                    _name = _names[i];
                    _o[_name] = typeof obj[_name] === 'undefined' ? includes[_name] : obj[_name];
                }

                return _o;
            } else {
                return obj;
            }
        }
        /**
         * 把一个对象转变为一个[key, value]形式的数组。 
         */
        , pairs: function (obj) {
            var keys = util.keys(obj);
            var length = keys.length;
            var pairs = Array(length);
            for (var i = 0; i < length; i++) {
                pairs[i] = [keys[i], obj[keys[i]]];
            }
            return pairs;
        }
        /**
         * 对象（深）拷贝（from jQuery）
         */
        , extend: function () {
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if (typeof target === "boolean") {
                deep = target;

                // Skip the boolean and the target
                target = arguments[i] || {};
                i++;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if (typeof target !== "object" && !util.isFunction(target)) {
                target = {};
            }

            // Extend empty ojbect if only one argument is passed
            if (i === length) {
                //target = this;
                target = {};
                i--;
            }

            for (; i < length; i++) {

                // Only deal with non-null/undefined values
                if ((options = arguments[i]) !== null) {

                    // Extend the base object
                    for (name in options) {
                        src = target[name];
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && (util.isPlainObject(copy) ||
                            (copyIsArray = util.isArray(copy)))) {

                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && util.isArray(src) ? src : [];

                            } else {
                                clone = src && util.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[name] = util.extend(deep, clone, copy);

                            // Don't bring in undefined values
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        }

        ////////////////////////// string methods
        /**
         * 判断str是否是以字符串searchString开头。
         * @param {string} str - 源字符串
         * @param {string} startStr - 要搜索的开始字符串
         * @param {boolean} ignorCase - 比较时是否忽略大小写，默认false
         * @param {boolean} trimEmpty - 比较时是否忽略字符串的头尾空格，默认true
         */
        , startWith: function (str, startStr, ignorCase, trimEmpty) {
            if (str && startStr) {
                // ignore case or trim empty string
                ignorCase = util.type(ignorCase) === 'boolean' ? ignorCase : false;
                trimEmpty = util.type(trimEmpty) === 'boolean' ? trimEmpty : true;

                if (trimEmpty) { str = (str + '').trim(); startStr = (startStr + '').trim(); }
                if (ignorCase) { str = str.toLowerCase(); startStr = startStr.toLowerCase(); }
                
                return (str.substr(0, startStr.length) === startStr);
            } else {
                return false;
            }
        }


        ////////////////////////// functions...
        /**
         * 一个函数只有在运行了“指定次数”之后才有效果。
         * @param {int} times - 次数
         * @param {function} fn - 将被执行的函数
         */
        , after: function (times, fn) {
            return function () {
                if (--times < 1) {
                    return fn.apply(this, arguments);
                }
            };
        }
        /**
         * 一个函数调用不超过“指定次数”，当次数已经达到时，最后一个函数调用的结果将被记住并返回。 
         * @param {int} times - 次数
         * @param {function} fn - 将被执行的函数
         * @return {function} - 执行将不超过times次的函数副本
         */
        , before: function (times, fn) {
            var _fn_result;
            return function () {
                if (--times > 0)
                    _fn_result = fn.apply(this, arguments);
                if (times <= 1)
                    fn = null;
                return _fn_result;
            };
        }
    };
    // util alias
    util.unique = util.uniq;




    //(Event)=============================================================================
    var event = Crab.event = {
        /**
         * 给当前对象绑定事件。（别名：bind）
         * @param { string|object{name, callback} } name - 绑定的事件名称，也可以是一个定义事件名称、回调的对象
         * @param {function} callback - 事件触发时的回调
         * @param {object} context - 触发事件回调的指针（及回调函数体中的this），默认为事件绑定到的对象
         */
        on: function (name, callback, context) {
            if (!_event_api(this, 'on', name, [callback, context]) || !callback)
                return this;
            this.$events || (this.$events = {});
            // 当前事件标记可能挂起多个回调
            var _events = this.$events[name] || (this.$events[name] = []);
            _events.push({
                callback: callback,
                context: context || this
            });
            return this;
        }
        /**
         * 同event.on，区别在于使用once绑定将只执行一次，执行后回调将被销毁。
         * @param 参数同event.on
         */
        , once: function (name, callback, context) {
            if (!_event_api(this, 'once', name, [callback, context]) || !callback)
                return this;
            var _self = this;
            var _once = util.before(2, function () {
                callback.apply(this, arguments);
                // TODO:执行后删除once回调
                _self.off(name, _once);
            });
            return this.on(name, _once, context);
        }
        /**
         * 移除对象上已绑定的事件。
         * a.若未指定事件名称、回调、作用域，则移除当前对象所有的事件；
         * b.若只传入事件名称，则移除该事件标记下的所有回调；
         * c.若传入了事件名称和回调，则移除该事件标记下的指定回调
         * @param 参数同event.on
         */
        , off: function (name, callback, context) {
            var retain, ev, events, names, i, l, j, k;
            if (!this.$events || !_event_api(this, 'off', name, [callback, context])) return this;
            if (!name && !callback && !context) {
                this.$events = void 0;
                return this;
            }
            names = name ? [name] : util.keys(this.$events);
            for (i = 0, l = names.length; i < l; i++) {
                name = names[i];
                if (events = this.$events[name]) {
                    this.$events[name] = retain = [];
                    if (callback || context) {
                        for (j = 0, k = events.length; j < k; j++) {
                            ev = events[j];
                            if ((callback && callback !== ev.callback) ||
                                (context && context !== ev.context)) {
                                retain.push(ev);
                            }
                        }
                    }
                    if (!retain.length) delete this.$events[name];
                }
            }

            return this;
        }
        /**
         * 手动触发指定事件。
         * @param {string} name - 事件名称
         * @param {...} *args - 传递到回调的（任意多个）参数
         */
        , trigger: function (name) {
            if (!this.$events) return this;
            var _args = _slice.call(arguments, 1);
            if (!_event_api(this, 'trigger', name, _args)) return this;
            var _events = this.$events[name];
            if (_events)
                _trigger_event(_events, _args);
            return this;
        }
    };
    // event alias
    event.bind = event.on;
    event.unbind = event.off;

    var _event_splitter = /\s+/,
        // 存在已定义的事件时返回 false
        _event_api = function (owner, action, name, reset) {
            if (!name) return true;

            // like: 'change:age change [...]'
            if (util.isString(name) && _event_splitter.test(name)) {
                var _names = name.split(_event_splitter);
                for (var i = 0; i < _names.length; i++) {
                    owner[action].apply(owner, [_names[i]].concat(reset));
                }
                return false;
            }
                // name is a object
            else if (util.isObject(name)) {
                for (var _k in name) {
                    owner[action].apply(owner, [_k, name[_k]].concat(reset));
                }
                return false;
            }
            return true;
        },
        _trigger_event = function (events, args) {
            for (var i = 0, evt, l = events.length; i < l; i++) {
                (evt = events[i]).callback.apply(evt.context, args);
            }
        };



    //(Model)=============================================================================


    /**
     * 数据模型。
     * @param {object} attributes - 属性对象
     * 
     */
    var Model = Crab.Model = function () {
        var _self = this;

        // model 唯一id（字符串）
        _self.$cid = counter.newid('m');

        // model 唯一id（正整数）
        _self.$id = counter.model;

        // 字段（属性存取的介质），也可视为自定义模型属性的键值散列对象
        _self.$attributes = {};

        // 标记当前对象模型自初始化（Model.create）后（任何自定义模型属性值）是否发生过改变，及“赃值标记”
        _self.$dirty = false;

        // 模型事件调度仓库，具体事件绑定建议通过"on / bind"
        // change[:property], invalid[:property]...
        _self.$events = null;

        // 当前模型所属的集合对象
        // 不需要手动指定，在当前model添加到集合（Collection）时会自动标记集合对象
        _self.$collection = null;

        // 当前模型所绑定的视图对象，不需手动指定（在为视图指定数据源时会自动为model关联视图）
        // 当视图不为空时每次值的变化都将同步到页面视图（html-document)，但从html-document同步值到model除外
        _self.$views = [];


        // Model被实例化时执行
        _self.initialize = function () {};

    };

    /**
     * Model相关默认值配置。
     */
    var modelDefaults = Model.defaults = {
        // 生成模型id时的前缀，也用作DOM元素的class属性
        idPrefix: 'crab-m'

        // model字段（基于属性名称）的前缀
        , attrPrefix: ''

        // 设置属性值set()的特性参数
        , setOptions: {
            // 设置属性值时是否保持“静默”（为true时不会触发相应事件）
            silent: false,
            // 是否校验将要设置的值
            //valid: true,
            // 是否校验属性名称（是否是模型中已定义的属性散列）
            validName: false,
            // 在设置属性值时是否同步“赃值标记”（$dirty）
            syncDirty: true
        }
        // model验证默认验证对象为字段值（$attribute）
        , validTo: 'a'
    };

    /**
     * Model属性初始值存储介质。
     */
    Model.$localProps = {};

    /**
     * 创建一个Model实例。
     * 如果传入一个定义初始值的对象，在模型实例创建后将自动附加，并且这个操作不会触发change事件和赃值标记（$dirty）；
     * 这一般在ajax返回模型数据后再生成实例操作中非常实用。
     * @param {*object} initValues - 定义初始值的键值散列值
     */
    Model.create = function (initValues) {
        var _self = this,
            _instance = new _self();
        
        // 定义属性存取器（getter、setter）
        _define_properties.call(_instance, modelDefaults.attrPrefix, _self.$localProps);

        // 设置初始化值
        if (util.isObject(initValues)) {
            var _vals = util.within(initValues, util.keys(_self.$localProps));
            _instance.set(_vals, {
                syncDirty: false,
                silent: true
            });
        }

        // 验证器初始化
        _instance.syncValidator(true);

        // 初始化完成后执行回调
        _instance.initialize();

        return _instance;
    };

    // Model 原型扩展
    util.extend(Model.prototype, event, {
        $isModel: true
        /**
         * 当前model父类的指针。
         */
        , $parent: Model
        /**
         * $getter & $setter （属性存取器）
         * ！！！ 注意：禁止子类属性存取器覆盖父类中的定义！！！
         */
        , $getter: null
        , $setter: null
        /**
         * 属性验证器；未定义的验证器的属性在验证过程中默认返回true。
         * ！！！ 注意 ！！！
         * 1.禁止子类属性验证器覆盖父类中的定义；
         * 2.如果在Model实例化过后再手动指定$validator，则需要手动调用一次 syncValidator()。
         * <string> | {core:function, validTo: 'a'|'p', index:number, tip:string}
         * 1.当验证声明是一个字符串时，其值必须是Crab.validator中已定义的对象属性名称，
         *   如果有多个验证声明用英文逗号(",")隔开，例如："email", "phone, required"...
         * 2.当验证声明是一个对象时，其中 validTo 参数有两个可选值，默认验证“字段”值（$attributes），
         *   如果当前类中所有的验证对象都是“属性”（property），建议重写系统默认值（[ModelClass].defaults.validTo）为 "p"，这样代码将更简洁：
         *   a."a" 表示该验证逻辑作用于“字段”值，同时验证函数core的作用域指针也指向 $attributes；
         *   b."p" 表示验证逻辑用语验证“属性”值，同时验证函数core的作用域指向当前模型对象。
         */
        , $validator: null
        /**
         * 同步设置验证器的属性并设置验证缓存。
         * 若是再ModelClass中制订了该类的验证器，则当其实例化时将自动调用该函数，
         * 否则（在为某一实例手动指定验证器后）需要手动调用。
         * @param {boolean} destroyValidator - 设置验证器缓存后是否销毁用户关于验证器的定义。
         */
        , syncValidator: function (destroyValidator) {
            var $valid = this.$validator;
            if (!$valid) return;

            var _self = this,
                _modelDefaultValidTo = _self.constructor.defaults.validTo,
                _p = '';
            // 同步默认值
            for (_p in $valid) {
                $valid[_p] = util.extend({}, { validTo: _modelDefaultValidTo, index: 0, tip: '' }, $valid[_p]);
                $valid[_p].validTo = $valid[_p].validTo.toLowerCase();
            }
            // 设置验证器缓存
            _self.$validatorCache = _sort.call(util.pairs($valid), function (p, n) {
                return p[1].index > n[1].index;
            });

            if (destroyValidator === true) _self.$validator = null;
        }
        /**
         * 验证模型数据是否通过已定义的验证逻辑($validator)；
         * 验证失败时触发 "invalid" 事件，其中，指示验证失败的属性的事件参数指向第一个失败时的属性。
         * @param {function} callback - 验证失败时的回调
         * @return {boolean} - 是否通过验证
         */
        , validate: function (callback) {
            var _self = this,
                _validSuccess = true,
                _validProp = '',
                _validVal = null;
            var $cache = _self.$validatorCache;
            if ($cache) {
                for (var i = 0, l = $cache.length, _valid; i < l; i++) {
                    _validProp = $cache[i][0];
                    _valid = $cache[i][1];
                    if (!_valid.core || !_self.hasDefineProperty(_validProp)) continue;

                    // 验证 "$attributes"
                    if (_valid.validTo === 'a') {
                        _validVal = _self.$attributes[_validProp];
                        _validSuccess = util.isString(_valid.core)
                            ? _sys_validate(_valid.core, _validVal)
                            : _valid.core.call(_self.$attributes, _validVal);
                    }
                        // 验证 "property"
                    else {
                        _validVal = _self[_validProp];
                        _validSuccess = util.isString(_valid.core)
                            ? _sys_validate(_valid.core, _validVal)
                            : _valid.core.call(_self, _validVal);
                    }

                    if (!_validSuccess) {
                        // 触发验证失败事件
                        var _hasPropInvalidEvent = (_self.$events && _self.$events['invalid:' + _validProp]);
                        // 1.触发 "invalid:[PROPERTY]" 事件时，系统参数按顺序为：value(验证失败的值)、model(模型)
                        if (_hasPropInvalidEvent) _self.trigger('invalid:' + _validProp, _validVal, _self);
                        // 2.触发 "invalid"(模型验证失败)事件时，
                        //   系统参数按顺序为：propertyName(验证失败的属性名称)、value(验证失败的值)、model(模型)
                        else _self.trigger('invalid', _validProp, _validVal, _self);

                        // 触发验证失败的回调
                        if (util.isFunction(callback))
                            callback.call(_self, _valid.tip, _validProp);

                        break;
                    }
                }// end loop
            }
            return !!_validSuccess;
        }
        /**
         * 使用代理ajax将当前model数据post到远程服务。
         * @param {string} url - 请求地址
         * @param {options} object - ajax请求参数设定
         */
        , post: function (url, options) {
            if (Crab.ajax) {
                options || (options = {});
                var _extras = options.data,
                	_model = util.extend({}, this.toJSON()),
                	_mk = '';
                // 检查要提交的model数据中是否包含null|undefined值
                for (_mk in _model) {
                	if (_isNullOrUndefined(_model[_mk]))
                		_model[_mk]= '';
                }
                options.data = util.extend(true, {}, _model, _extras);
                options.type = 'POST';
                Crab.ajax(url, options);
            } else {
                util.error('未设置 Crab.ajax 的代理，"' + url + '"调用失败！');
            }
        }
        /**
         * 判断当前模型实例是否可以访问指定名称的成员（搜索所有的实例属性和原型属性）。
         * @param {string} attr - 属性/方法名称
         */
        , has: function (attr) {
            return (attr in this);
        }
        /**
         * 判断当前模型实例中是否包含自定义的某个属性。
         * @param {string} attr - 属性名称
         */
        , hasDefineProperty: function (attr) {
            return _hasOwnProp.call(this.$attributes, attr);
        }
        /**
         * 判断当前model类型是否是指定类型的子类。
         * @modelClass {constructor|class} - 父类类型
         */
        , is: function (modelClass) {
            return (this instanceof modelClass);
        }
        /**
         * 通过属性名称获取属性值。
         * @param {string} attr - 属性名称
         */
        , get: function (attr) {
            return this[attr];
        }
        /**
         * 通过属性名称设置属性值。
         * @param {string|object} attr - 属性名称或一个属性键值对象
         * @param {*|array<*>} val - 属性值
         * @param {object} options - 特性定义
         *   @options.silent {boolean} - 是否静默（为 true 时不触发onchange事件），默认为 false
         *   @options.validName {boolean} - 是否验证要设置值的属性名称是否是model中定义的属性，默认为 false
         *   TODO: @options.valid {boolean} - 设置值时是否通过已定义的验证逻辑进行验证，默认为 true 
         *   @options.syncDirty {boolean} - 设置值时是否同步赃值标记状态，注意：仅用于标记自定义的属性（函数除外），默认为 true
         * @return {object} - 当前Model实例对象
         */
        , set: function (attr, val, options) {
            var _self = this,
                _opts = {};

            // 字符串
            if (util.isString(attr)) {
                _opts = util.extend({}, modelDefaults.setOptions, options);
                _default_setter(_self, attr, val, _opts, true);
            }
            // 对象
            else if (util.isObject(attr)) {
                // 此时最多只有两个参数
                _opts = util.extend({}, modelDefaults.setOptions, val);
                var _k = '';
                for (_k in attr) {
                    _default_setter(_self, _k, attr[_k], _opts, true);
                }
            }
            _opts = null;
            return _self;
        }
        /**
         * 深度克隆一个当前实体对象的副本。
         *
         */
        , clone: function () {
            return util.extend(true, {}, this);
        }
        /**
         * 返回与服务器数据相同结构的键值对象。
         */
        , toJSON: function () {
            return this.$attributes;
        }
    });
    var _sys_model_member = [
        // properties
        '$id', '$cid', '$attributes', '$events', '$getter', '$setter',
        '$validator', '$collection', '$dirty', '$parent', '$views', '__view'
        // methods
        //, 'initialize', 'has', 'is', 'get', 'set', 'clone'
        // events
        //, 'onchange'
    ]
    , _isModel = function (obj) {
        return (obj && obj.is && obj.is(Model));
    }
    , _default_getter = function (model, p) {
        if (model.$getter && util.isFunction(model.$getter[p]))
            return model.$getter[p].call(model.$attributes, model);
        else
            return model.$attributes[modelDefaults.attrPrefix + p];
    }
    // renderView {boolean} 用于区分是普通赋值还是从view同步值至model，如果是同步值，就不需要渲染视图；
    // crtView {View} 当renderView为false时，该值有效，为被编辑的视图对象。
    , _default_setter = function (model, p, v, opts, renderView, crtView) {

        // 验证要设置值的属性名是否是类中的自定义属性
        if (opts.validName === true && !model.hasDefineProperty(p)) {
            util.error('设置的数据模型中不包含属性“' + p + '”');
            return;
        }

        // the model value before "set"
        var _pre_val = model[p];

        // core: set value of model
        if (model.$setter && util.isFunction(model.$setter[p]))
            model.$setter[p].call(model.$attributes, v, model);
        else
            model.$attributes[modelDefaults.attrPrefix + p] = v;

        // 新、旧值比对：采用强类型和引用比对（为了防止 "0==false => true" 这种情况）
        var isDefinedPropAndChanged = (model.hasDefineProperty(p) && _pre_val !== model[p]);
        // syncDirty: 是否同步赃值标记状态，仅用于标记自定义的属性（函数除外），系统成员除外
        if (opts.syncDirty === true && !model.$dirty && isDefinedPropAndChanged) {
            model.$dirty = true;
        }

        // 触发change事件
        if (opts.silent === false) {
            var _hasPropChangeEvent = (model.$events && model.$events['change:' + p]);
            // 1.触发 "change:[PROPERTY]" 事件时，系统参数依次为：value(属性改变后的值)、model(模型)
            if (_hasPropChangeEvent) model.trigger('change:' + p, model[p], model);

                // 2.触发 "change"(模型改变)事件时，系统参数依次为：propertyName(值改变的属性名称)、model(模型)
            else model.trigger('change', p, model);

            // 3.触发模型所属集合的 "update" 事件，系统参数依次为：model（模型）、propertyName（值更新的属性名称）
            if (model.$collection) model.$collection.trigger('update', model, p);
        }

        // 更新视图
        if (isDefinedPropAndChanged) {
            // 1.通知视图更新
            if (renderView) {
                _render(model.$views, function (v) {
                    v.render('update:model', model, p);
                });
            }
                // 当renderView 为 false 时（即从页面表单同步值到model），更新绑定了同一个model的除当前被编辑视图之外的视图
            else if (renderView === false) {
                if (model.$views.length > 1 && crtView) {
                    _each.call(model.$views, function (v) {
                        if (v !== crtView) v.render('update:model', model, p);
                    });
                }
            }
            // 2.如果当前model有所属的Collection，则通知集合需要更新视图
            // 注意：集合的更新不受参数 "renderView" 的限制，考虑到某种特殊情况：
            //       当前model被指定到一个视图，并且其所属的集合也被绑定到视图
            if (model.$collection) {
                _render(model.$collection.$views, function (v) {
                    v.render('update:collection', model, p);
                });
            }
        }
    }
    , _define_property = function (model, p) {
        Object.defineProperty(model, p, {
            get: function () {
                return _default_getter(model, p);
            },
            set: function (v) {
                _default_setter(model, p, v, modelDefaults.setOptions, true);
            }
        });
    }
    , _define_properties = function (attrPrefix, attrs) {
        if (attrs) {
            for (var p in attrs) {
                // 默认值设置
                this.$attributes[attrPrefix + p] = attrs[p];
                // 定义getter、setter选择器
                _define_property(this, p);
            }
        }
    }
    , _sys_validate = function (validNames, val) {
        var _validArr = validNames.split(','), _validName = '', _r = true;
        for (var i = 0, l = _validArr.length; i < l; i++) {
            _validName = _validArr[i].trim();
            if (!_validName) continue;
            if (!validator[_validName]) util.error('指定的系统验证器 "' + _validName + '" 无效。');
            if ((_r = validator[_validName](val)) === false) break;
        }
        return _r;
    };
    


    //(Collection)=============================================================================
    /**
     * 集合。
     *
     */
    var Collection = Crab.Collection = function () {
        var _self = this;
        
        // collection 唯一id（字符串）
        _self.$cid = counter.newid('c');

        // collection 唯一id（正整数）
        _self.$id = counter.collection;

        // 事件调度仓库，同Model.$events
        // add, addFailed, clear, remove, update(model更新时触发此事件)
        _self.$events = null;

        // 当前集合所绑定的视图对象，不需手动指定（在为视图指定数据源时会自动为集合关联视图）
        // 当视图不为空时每次 "add", "clear", "remove", "update(model更新)" 操作都将更新视图（html-document）
        _self.$views = [];

        // $model类型的实例数组
        _self.$models = [];
    };

    /**
     * Collection相关默认值配置。
     */
    var collectionDefaults = Collection.defaults = {
        // 生成模型id时的前缀，也用作DOM元素的class属性
        idPrefix: 'crab-c'

        // 设置属性值set()的特性参数
        , setOptions: {
            // 设置属性值时是否保持“静默”（为true时不会触发相应事件）
            silent: false
        }
    };

    /**
     * 创建一个集合实例。
     * 如果传入一个初始值，在集合实例创建后将自动附加，并且这个操作不会触发add事件；
     * 这一般在ajax返回模型数据后再生成实例操作中非常实用。
     * @param {*object|array} initValues - 集合初始值对象或数组
     */
    Collection.create = function (initValues) {
        var _self = this,
            _instance = new _self();

        if (initValues)
            _instance.add(initValues, { silent: true });

        return _instance;
    };

    util.extend(Collection.prototype, event, {
        $isCollection: true
        /**
         * 当前集合的父类。
         */
        , $parent: Collection

        /**
         * 集合类型。
         */
        , $model: Model

        /**
         * 获取集合长度。
         */
        , length: function () {
            return this.$models.length;
        }

        /**
         * 将一个对象或者对象数组添加到集合（Collection）中；
         * 有添加失败的项时最后将触发 "addFailed" 事件；有添加成功时最后将触发 "add" 事件。
         * @param {object|array} objs - 将要添加到集合的对象或对象数组
         * @param {object} options - 添加项时的行为，具体参加[CollectionClass].defaults.setOptions
         */
        , add: function (objs, options) {
            var _self = this,
                _addSuccess = false,
                _addFailed = [],
                _addStartIndex = _self.$models.length,
                _addEndIndex = 0;

            var _opts = util.extend({}, collectionDefaults.setOptions, options);

            // add array
            if (util.isArray(objs)) {
                for (var i = 0, l = objs.length; i < l; i++) {
                    if ( !(_addSuccess = _add_coll_model.call(_self, objs[i])) )
                        _addFailed.push(objs[i]);
                }
            }
            // add object
            else {
                if ( !(_addSuccess = _add_coll_model.call(_self, objs)) ) _addFailed.push(objs);
            }

            var _addedSuccessMoreThanOne = (_addEndIndex = _self.$models.length) > _addStartIndex;

            if (_opts.silent === false) {
                // 触发事件：addFailed，事件参数为添加失败的元素的数组
                if (_addFailed.length)
                    _self.trigger('addFailed', _addFailed);
                // 触发事件：add，事件参数依次为添加成功的元素的开始索引（包含）和结束索引（不包含）
                if (_addedSuccessMoreThanOne) {
                    _self.trigger('add', _addStartIndex, _addEndIndex);
                }
            }

            // 渲染页面
            if (_addedSuccessMoreThanOne) {
                var _added = _self.get(_addStartIndex, _addEndIndex);
                _render(_self.$views, function (v) {
                    v.render('add', _added);
                });
                _added = null;
            }
        }
        /**
         * 清空集合。（$models = []）
         * @param {object} options - 同add
         */
        , clear: function (options) {
            this.$models = [];
            var _opts = util.extend({}, collectionDefaults.setOptions, options);
            // 触发 "clear" 事件
            if (_opts.silent === false) this.trigger('clear');
            // 渲染
            _render(this.$views, function(v){
                v.render('clear');
            });
        }

        /**
		 * 删除集合中指定位置的对象，并返回已删除的对象；
         * @param {int} index - 待删除对象的位置索引
         * @param {object} options - 同add
		 */
        , removeAt: function (index, options) {
            var _self = this,
                _removed = util.removeAt(_self.$models, index);

            var _opts = util.extend({}, collectionDefaults.setOptions, options);
            // 触发 "remove" 事件
            if (_opts.silent === false && _removed) _self.trigger('remove', [_removed]);
            try {
                return _removed;
            } finally {
                // 渲染
                var __r = [_removed];
                if (_removed) _render(_self.$views, function (v) { v.render('remove', __r); });
                __r = null;
            }
        }
        /**
         * 删除集合指定索引区间（前闭后开）之间的元素，返回删除成功的元素数组；
         * 如果不指定结束索引，则删除从开始索引至数组末尾的元素；
         * 删除成功后将触发 "remove" 事件。
         * @param {int|model|array<model>|function} index - 开始位置索引或者要移除的model(数组）
         * @param {*int} indexEnd - 结束位置索引
         * @param {object} options - 同add
         * @return {array} 被删除的元素的数组
         */
        , remove: function () {
            var l = arguments.length,
                arg0 = arguments[0],
                arg1 = arguments[1];
            var _self = this, _removed = [], _o = null;
            if (l === 0) return _removed;
            
            // 移除指定索引范围内的元素
            if (util.isNumeric(arg0)) {
                arg0 = parseInt(arg0);
                arg1 = parseInt(arg1);
                if (util.isPlainObject(arguments[l - 1])) _o = arguments[l - 1];
                if (l === 1) _removed = util.remove(_self.$models, arg0);
                else if (l > 1 && util.isNumeric(arg1)) _removed = util.remove(_self.$models, arg0, arg1);
            }
            // 移除一个Model
            else if (_isModel(arg0)) {
                _o = arg1;
                var __m_index = util.findIndex(_self.$models, function (m) { return m.$id === arg0.$id; }),
                    __m_removed;
                if ( __m_index > -1 && (__m_removed = util.removeAt(_self.$models, __m_index)) ) {
                    _removed.push(__m_removed);
                }
            }
            // 移除一个Model数组
            else if (util.isArray(arg0)) {
                _o = arg1;
                _each.call(arg0, function (m) {
                    if (_isModel(m)) {
                        var __temp, __temp_index = -1;
                        __temp_index = util.findIndex(_self.$models, function (o) { return o.$id === m.$id; });
                        if ( __temp_index > -1 && (__temp = util.removeAt(_self.$models, __temp_index)) )
                            _removed.push(__temp);
                    }
                });
            }
            // 移除通过真值检测函数的model
            else if (util.isFunction(arg0)) {
                _o = arg1;
                var __r_idxes = [];
                _each.call(_self.$models, function (m, _i) {
                    if (arg0(m, _i)) __r_idxes.push(_i);
                });
                if (__r_idxes.length) {
                    _each.call(__r_idxes, function (_ri) {
                        var _rd;
                        if (_rd = util.removeAt(_self.$models, _ri)) _removed.push(_rd);
                    });
                }
            }

            var _opts = util.extend({}, collectionDefaults.setOptions, _o),
                _removeSuccess = (_removed && _removed.length > 0);
            // 触发事件
            if (_opts.silent === false && _removeSuccess) this.trigger('remove', _removed);

            try {
                return _removed;
            } finally {
                // 渲染
                if (_removeSuccess) _render(_self.$views, function (v) { v.render('remove', _removed); });
            }
        }
        /**
         * 获取指定索引区间（前闭后开，同Array.slice()）的集合元素；
         * 若未指定结束索引，则返回从开始索引至末尾的元素。
         * @param {int} index - 开始索引（包含）
         * @param {*int} indexEnd - 结束索引（不包含）
         */
        , get: function (index, indexEnd) {
            if (arguments.length === 0) return;
            return _slice.apply(this.$models, arguments);
        }
        /**
         * 获取集合中指定索引位置的元素。
         * @param {int} - index 索引
         */
        , getAt: function (index) {
            return this.$models[index];
        }
        /**
         * 查找一个集合中的元素，未找到返回undefined。
         * @param {function|number|string} predicate - 一个返回bool值的检测函数或指定集合中模型的$id或$cid
         *  1.function 一个具有布尔返回值的检测函数，函数参数依次为 model（模型）、index（当前索引）
         *  2.number   查找指定 $id 的集合中的model
         *  3.string   查找指定 $cid 的集合中的model
         * @param {Model}
         */
        , find: function (predicate) {
            if (util.isFunction(predicate))
                return util.find(this.$models, predicate);
            else if (util.isNumeric(predicate))
                return util.find(this.$models, function (obj) {
                    return obj.$id === parseInt(predicate);
                });
            else if (util.isString(predicate))
                return util.find(this.$models, function (obj) {
                    return obj.$cid === predicate;
                });
        }
        /**
         * 返回第一个通过predicate迭代函数真值检测的数组元素值的索引，没找到返回 -1。
         * @param {function} predicate - 一个返回bool值的检测函数
         * @param {number}
         */
        , findIndex: function (predicate) {
            return util.findIndex(this.$models, predicate);
        }
        /**
         * 与 find 类似，但 findAll 将返回所有通过迭代函数的元素数组。
         * @param {function} predicate - 一个返回bool值的检测函数
         * @return {array}
         */
        , findAll: function (predicate) {
            return _filter.call(this.$models, predicate);
        }
        /**
         * 判断是否存在通过predicate迭代函数真值检测的数组元素。
         * @param {function} predicate - 一个返回bool值的检测函数
         * @param {boolean}
         */
        , exist: function (predicate) {
            return util.findIndex(this.$models, predicate) !== -1;
        }
        /**
         * 循环代理。（use Array.forEach）
         */
        , each: function (callback) {
            _each.call(this.$models, callback);
        }
        /**
         * 对集合的每个元素进行映射操作。
         * @param {function} callback 数组迭代函数
         * @param {*boolean} resetCollection 是否将映射结果重置当前集合，默认为 false
         * @return {array} 映射的新的数组
         */
        , map: function (callback, resetCollection) {
            var r = _map.call(this.$models, callback);
            if (resetCollection === true) this.$models = r;
            return r;
        }
    });

    var _add_coll_model = function (obj) {
        if (util.isObject(obj)) {
            var _self = this,
                _addSuccess = false;

            if (!obj.$id) {
                var _newModel = _self.$model.create(obj);
                _newModel.$collection = _self;  // 指定model所属的collection
                _self.$models.push(_newModel);
                _addSuccess = true;
            }
            else {
                // 判断是否已添加过该model
                if (_self.find(obj.$id)) return false;
                // 判断是否是指定类型的数据模型
                if (obj.is(_self.$model)) {
                    obj.$collection = _self;    // 指定model所属的collection
                    _self.$models.push(obj);
                    _addSuccess = true;
                }
            }
            return _addSuccess;
        }
        // "obj" is not a Object, add faild.
        else {
            return false;
        }
    };


    //(View)=============================================================================
    var View = Crab.View = function () {
        var _self = this;

        // $id & $cid
        _self.$cid = counter.newid('v');
        _self.$id = counter.view;

        // 事件调度仓库，同Model.$events
        // -------------------------------------------------------------------------
        //    <$data>   init(初始化) update(更新) add(新增) remove(删除) clear(清空)
        //      Model       √           √          ×         ×           ×
        // Collection       √           √          √         √           √
        // -------------------------------------------------------------------------
        _self.$events = null;

        // 视图的容器(DOM)
        _self.$container = null;

        // 视图模板字符串或模板id（以"#"开头）
        _self.$tmpl = '';
        // 要绑定到视图模板中的自定义数据{Object}（键值不要使用系统变量 $model）
        _self.$tmplData = null;

        // Model属性绑定到对应视图控件的指定
        _self.$bind = null;

        // 在未渲染Modle视图之前，是否已存在DOM结构，默认不存在。
        // 注意：
        //  a.该参数只应在当前视图的 $data 是或将是 Crab.Model或其子类类型时有效；
        //  b.当该参数为 true 时，不应指定 $tmpl。
        _self.$hasModelElement = false;

        // 当Model属性值改变但属性未在 $bind 中指定与DOM的映射时是否重新渲染整个视图
        // 注意：
        //  a.该参数只应在当前视图的 $data 是 Crab.Model或其子类类型时有效；
        _self.$reRender = false;

        // 视图要渲染的额数据(Model | Collection)
        _self.$data = null;

        // 根据模板生成html内容函数，创建(create)时自动生成
        _self.parseTmpl = function () { return '<em style="color:red">未指定模板内容！</em>' };

        // 当集合为空时页面显示的内容的定义
        _self.$placeholder = {
            $show: false,                       // 集合为空时默认不显示
            $text: '糟糕，未找到相关数据',     	// 默认文本
            $cls: 'nodata',                     // DOMClassToken
            $el: null                           // DOM节点的缓存
        };
    };
    // 生成视图id时的前缀，也用作DOM元素的class属性
    var viewDefaults = View.defaults = {
        idPrefix: 'crab-v'
        // 当编译生成后的html(element(s))没有容器包裹时的系统默认包裹容器
        , wrapper: 'div'
    };

    /**
     * 创建一个视图，并可以指定要渲染的页面容器。
     * @param {object} initialize - 初始化对象，一般只需指定 $container 和 $tmpl,
     *  $container必须是一个容器的CSS选择符（W3C标准）字符串，如："#id", ".class", "div ul"...
     * @param {object} artTemplateCompileOpts - artTemplate编译参数，
     *  详情参见：https://github.com/aui/artTemplate#templateconfigname-value
     */
    View.create = function (initialize, artTemplateCompileOpts) {
        var _self = this,
            _view = new _self();
        
        util.extend(true, _view, initialize);
        
        // 转换$container为DOM对象
        var _c = _view.$container;
        if (_c && util.isString(_c)) {
            _view.$container = document.querySelector(_c);
            _view.$container.classList.add(_self.defaults.idPrefix, _view.$cid);
            _view.$container.setAttribute('data-view-id', _view.$id);
        }
        if (!_view.$container) {
            util.error('必须为视图 "' + _view.$cid + '" 指定容器。');
            return;
        }

        // 如果当前（Model）视图已存在DOM结构，则将该DOM结构优化成合适的结构并作为模板内容
        if (_view.$hasModelElement === true) {
            var _hasModelCont = _view.$container.children.length === 1,
                _modelEl = null;

            if (!_hasModelCont) {
                _modelEl = document.createElement(_self.defaults.wrapper);
                _modelEl.innerHTML = _view.$container.innerHTML;
                _view.$container.innerHTML = _modelEl.outerHTML;
            } else {
                _modelEl = _view.$container.children[0];
            }
            _view.$tmpl = _modelEl.outerHTML;
            _modelEl = null;
            // TODO: 在位视图指定$data时，还需为DOM结构的class列表指定model的$cid；
            // 以及绑定自定义属性“data-model-id”，其值为model.$id。
            // like ↓↓↓
            //_modelEl.classList.add(modelDefaults.idPrefix, model.$cid);
            //_modelEl.setAttribute('data-model-id', model.$id);
        }

        // 编译模板html生成函数
        if (_view.$tmpl) {
            // TODO 判断是否引入 artTemplate.js, 解除在纯表单页（不需要重新渲染视图<reRender=false>）
            // 强制依赖 artTemplate 的问题，自此可在上述情况下不引入artTemplate！
            if (window.template) {
                var _tmpl = ((_view.$tmpl.length < 21 && util.startWith(_view.$tmpl, '#'))
                    ? document.getElementById(_view.$tmpl.substr(1)).innerHTML
                    : _view.$tmpl
                );
                _view.parseTmpl = template.compile(_tmpl, artTemplateCompileOpts);
            } else {
                _view.parseTmpl = function () { return '<em style="color:red">未找到 artTemplate 的引用，数据渲染失败！</em>' };
            }
        }

        // 设置$data存取器，截获给视图指定数据的动作，以便初始化（渲染）视图
        _define_view_data_prop.call(_view);

        // 监听视图控件值变化【目前只针对绑定Model的视图】
        _sync_model_vals.call(_view);

        return _view;
    };
    
    util.extend(View.prototype, event, {
        /**
         * 渲染视图；
         * 一般不需要手动render，系统将通过事件驱动自动渲染数据（Model|Collection）至页面。
         * @param {string} action - 渲染动作，类型有：
         *  1."init:[DIR]"  ：视图初始化
         *  2."update:[DIR]"：model更新
         *  3."add"         ：往集合中添加model(s)
         *  4."clear"       ：清除集合中的所有model
         *  5."remove"      ：移除集合中一定数量的model(s)
         */
        render:  function (action) {
            if (!action) return;

            var _self = this,
                _args = _slice.call(arguments, 1);
        
            switch (action) {
                // render for Model
                case 'init:model':
                    if (!_self.$hasModelElement) _self.$container.innerHTML = '';
                    _self.$container.appendChild(_init_model_view(!_self.$hasModelElement, _self, _args[0]));
                    // TODO 因在设置 $data 时，为绑定的model的每一个属性都对应了一个默认的id(#propName)，
                    // 因视图的复杂性，不一定每个属性在视图中都对应一个DOM，因此在视图初始化后(init:model)，
                    // 将不存在的绑定映射移出$bind，以避免不必要的DOM检索
                    var _mp = '', $dom = null, _deleteProps = [];
                    for (_mp in _self.$bind) {
                        if (!util.startWith(_self.$bind[_mp], '#')) continue;
                        if (!($dom = _self.$container.querySelector(_self.$bind[_mp])))
                            _deleteProps.push(_mp);
                    }
                    if (_deleteProps.length) {
                        _each.call(_deleteProps, function (p) {
                            delete _self.$bind[p];
                        });
                    }
                    _mp = $dom = _deleteProps = null;

                    _self.trigger('init', _args[0]);
                    break;
                case 'update:model':
                    var _updateModel = _args[0],
                        _updateProp = _args[1],
                        _updateEle = _self.$container.querySelector('.' + _updateModel.$cid);
                    if (_updateEle) {
                        if (_self.$bind && _hasOwnProp.call(_self.$bind, _updateProp)) {
                            _bind_view_data(_self.$bind, _updateEle, _updateModel, _updateProp);
                        }
                            // TODO: 如果在 $bind 中未定义当前model更新属性的与DOM的映射，则不更新视图（以下注释勿删！）
                        else {
                            // 重新渲染model视图
                            if (_self.$reRender) {
                                _self.$container.innerHTML = '';
                                _self.$container.appendChild(_init_model_view(true, _self, _updateModel));
                            }
                        }

                        _self.trigger('update', _updateModel, _updateProp);
                    }
                    break;

                    // render for Collection
                case 'init:collection':
                    if (_args[0].length) {
                        _self.$container.innerHTML = '';
                        _render_collection_added.call(_self, _args[0]);

                        _self.trigger('init', _args[0]);
                    }
                    _sync_placeholder.call(_self);
                    break;
                case 'update:collection':
                    var _updateModel = _args[0],
                        _modelPageElement = _self.$container.querySelector('.' + _updateModel.$cid);
                    if (_modelPageElement) {
                        var _updateElement = _init_model_view(true, _self, _updateModel);
                        _self.$container.insertBefore(_updateElement, _modelPageElement)
                        _self.$container.removeChild(_modelPageElement);

                        _self.trigger('update', _updateModel);
                    }
                    break;
                case 'add':
                    _render_collection_added.call(_self, _args[0]);
                    _sync_placeholder.call(_self);

                    _self.trigger('add', _args[0]);
                    break;
                case 'remove':
                    var _removedModels = _args[0], _removedModelElement;
                    _removedModels.forEach(function (m) {
                        if (_removedModelElement = _self.$container.querySelector('.' + m.$cid))
                            _self.$container.removeChild(_removedModelElement);
                    });
                    _sync_placeholder.call(_self);

                    _self.trigger('remove', _removedModels);
                    break;
                case 'clear':
                    _self.$container.innerHTML = '';
                    _self.$placeholder.$el = null;
                    _sync_placeholder.call(_self);

                    _self.trigger('clear');
                    break;
            }
        }
    });

    
    //View.prototype.render =;
    
    var _define_view_data_prop = function () {
        var _self = this;
        _self.__data = null;
        Object.defineProperty(_self, '$data', {
            get: function () { return _self.__data; },
            set: function () {
                var $d = arguments[0], isModel = false, isColl = false;
                // 只接受 Model 或者 Collection
                if (util.isObject($d)) {
                    isModel = $d.$isModel;
                    isColl = $d.$isCollection;
                    // 见 View.create() ==> "TODO"(line:1126)
                    if (isModel && _self.$hasModelElement) {
                        var _modelEl = _self.$container.children[0];
                        _modelEl.classList.add(modelDefaults.idPrefix, $d.$cid);
                        _modelEl.setAttribute('data-model-id', $d.$id);
                        _modelEl = null;
                    }
                    // 如果绑定的是Model，则给当前$bind设置默认值（#[PropertyName]）
                    if (isModel) {
                        _self.$bind || (_self.$bind = {});
                        var _mp = '';
                        for (_mp in $d.$attributes) {
                            if (_hasOwnProp.call(_self.$bind, _mp)) continue;
                            _self.$bind[_mp] = '#' + _mp;
                        }
                    }
                    // 设置$data并初始化视图
                    if (isModel || isColl) {
                        _self.__data = $d;
                        if (util.findIndex($d.$views, function (item) { return item === _self; }) === -1)
                            $d.$views.push(_self);
                        if (isModel) _self.render('init:model', $d);
                        else _self.render('init:collection', $d.$models);
                    }
                }
            }
        });
    }
    , _render = function (views, cb) {
        if (!util.isArray(views) || !views.length) return;
        _each.call(views, cb);
    }
    , _create_placeholder = function (v) {
        var _p = v.$placeholder;
        _p.$el = document.createElement('div');
        _p.$el.classList.add(_p.$cls);
        _p.$el.style.display = 'none';
        _p.$el.innerHTML = _p.$text;
        // append
        if (v.$data.$models.length) {
            var _first_col_itme;
            if (_first_col_itme = v.$container.querySelector('.' + v.$data.$models[0].$cid)) {
                v.$container.insertBefore(_p.$el, _first_col_itme);
                _first_col_itme = null;
            }
        } else {
            v.$container.appendChild(_p.$el);
        }
    }
    , _sync_placeholder = function () {
        if (this.$placeholder.$show) {
            if (!this.$placeholder.$el) _create_placeholder(this);
            this.$placeholder.$el.style.display = (this.$data.$models.length ? 'none' : 'block');
        }
    };

    var _render_collection_added = function (models) {
        if (!models || !models.length) return '';

        var _els = [], _self = this;
        models.forEach(function (model) {
            _els.push(_init_model_view(true, _self, model));
        });
        _els.forEach(function (el) {
            _self.$container.appendChild(el);
        });

        _els = null;
    }
    , _init_model_view = function (isNew, $view, model) {
        var _contElement = null;
        if (isNew) {
            var _tmplData = { $model: model };
            if ($view.$tmplData) util.extend(_tmplData, $view.$tmplData);
            var _modelHtml = $view.parseTmpl(_tmplData),
                _htmlParser = document.createElement($view.constructor.defaults.wrapper);
            _htmlParser.innerHTML = _modelHtml;

            // 如果视图模板生成的html外层没有容器，则使用指定wrapper包裹
            var _hasModelCont = _htmlParser.children.length === 1;
            _contElement = _hasModelCont ? _htmlParser.children[0] : _htmlParser;
            // 设置 class 和 data-model-id
            _contElement.classList.add(modelDefaults.idPrefix, model.$cid);
            _contElement.setAttribute('data-model-id', model.$id);
        } else {
            _contElement = $view.$container.children[0];
        }
        // 根据值绑定映射给控件设置value或者innerHTML
        _bind_view_data($view.$bind, _contElement, model);

        try { return _contElement } finally { _modelHtml = _contElement = null; }
    }
    , _bind_view_data = function ($bind, $el, model, changedProp) {
        if (!$bind) return;

        var _propEles, _propEle, _prop, _propVal, _nodeName, i, pel;
        for (_prop in $bind) {
            // 如果指定更新的model属性，则只绑定与其关联的控件的值；否则绑定全部$bind
            if (changedProp && _prop !== changedProp) continue;
            // 只绑定model中已定义的属性
            if (!model.hasDefineProperty(_prop)) continue;
            _propEles = $el.querySelectorAll($bind[_prop]);
            if (!_propEles || _propEles.length === 0) continue;
            _propVal = model[_prop];

            for (i = 0, pel = _propEles.length; i < pel && (_propEle = _propEles[i]) ; i++) {
                // 绑定 data-view-bind 以绑定控件对应的属性
                _propEle.setAttribute('data-view-bind', _prop);
                _nodeName = _propEle.nodeName;
                var _peVal = _propEle.value;
                // textbox(text, number, tel...) | radio | checkbox
                if (_nodeName === 'INPUT') {
                    if (_propEle.type === 'radio') {
                        if (_peVal === (_propVal + '')) _propEle.checked = true;
                    }
                    else if (_propEle.type === 'checkbox') {
                        if (util.isArray(_propVal) && _propVal.indexOf(_peVal) !== -1) _propEle.checked = true;
                        else if ((',' + _propVal + ',').indexOf(',' + _peVal + ',') !== -1) _propEle.checked = true;
                    }
                    else {
                        _propEle.value = _propVal;
                    }
                }
                else if (_nodeName === 'TEXTAREA') {
                    _propEle.value = _propVal;
                }
                else if (_nodeName === 'SELECT') {
                    if (_propEle.multiple) {
                        var __opts = _propEle.children, __opt;
                        for (var j = 0, opts_l = _propEle.children.length; j < opts_l && (__opt = _propEle.children[j]).nodeName === 'OPTION'; j++) {
                            if (util.isArray(_propVal) && _propVal.indexOf(__opt.value) !== -1) __opt.selected = true;
                            else if ((',' + _propVal + ',').indexOf(',' + __opt.value + ',') !== -1) __opt.selected = true;
                        }
                    }
                    else {
                        _propEle.value = _propVal;
                    }
                }
                else {
                    _propEle.innerHTML = _propVal;
                }
            }
        }
    }

    , _view_input_handler = -1
    , _sync_model_vals = function () {
        var _view = this,
            _core = function (evt) {
                if (!_view.$data.$isModel) return;
                var _el = evt.target,
                    _elName = _el.nodeName,
                    _bindProp = _el.getAttribute('data-view-bind'),
                    _changedVal = (_elName === 'INPUT' || _elName === 'TEXTAREA' || _elName === 'SELECT')
                                  ? _el.value : _el.innerHTML;
                if (_bindProp && _view.$data.hasDefineProperty(_bindProp) && _changedVal !== _view.$data[_bindProp]) {
                    _default_setter(_view.$data, _bindProp, _changedVal, modelDefaults.setOptions, false, _view);
                }
            };
        _view.$container.addEventListener('change', _core);
        _view.$container.addEventListener('input', function (e) {
            clearTimeout(_view_input_handler);
            _view_input_handler = setTimeout(function () {
                _core(e);
            }, 350);
        });
    };
    



    /**
     * 使用（原型链）继承生成一个具有父类所有特性的子类。
     * @param {object} protoProps - 子类的原型属性
     * @param {*object} instanceProps - 子类的实例属性
     * @param {*object} staticProps - 子类的类属性
     */
    var _extend = function (protoProps, instanceProps, staticProps) {
        var parent = this;
        var child = function () {
            var _childSelf = this;
            var _constructor = parent.apply(_childSelf, arguments);

            // 实例属性
            util.extend(true, _childSelf, instanceProps);

            return _constructor;
        };
        // 类（静态）属性
        util.extend(true, child, parent, staticProps);

        // prototype
        var Surrogate = function () { this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        // 原型属性
        if (protoProps) {
            util.extend(true, child.prototype, protoProps);
        }
        child.prototype.$parent = parent;

        // 子类静态属性
        // TODO: 目前只有Model包含 "$localProps"...
        if (child.$localProps) {
            child.$localProps = {};
            var locals = util.without(util.extend(true, {}, parent.$localProps, protoProps, instanceProps), _sys_model_member);
            for (var name in locals) {
                if (!util.isFunction(locals[name]))
                    child.$localProps[name] = locals[name];
            }
        }
        
        return child;
    };

    Model.extend = Collection.extend = View.extend = _extend;



    //(Counter)=============================================================================

    // Crab模块对象（模型、视图、全局）的计数器，主要用于实例对象$id的生成
    var counter = Crab.counter = {
        model: 0
        , view: 0
        , collection: 0
        , global: 0
        , newid: function (type) {
            var _typ = (type + '').toLowerCase();
            if (_typ === 'm')
                return modelDefaults.idPrefix + '-' + (++counter.model);
            else if (_typ === 'v')
                return viewDefaults.idPrefix + '-' + (++counter.view);
            else if (_typ === 'c')
                return collectionDefaults.idPrefix + '-' + (++counter.collection);
            else
                return 'crab' + '-' + (++counter.global);
        }
    };


    //(Validator)=============================================================================
    var _reg_email = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        _reg_phone = /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|17[0-9]{9}|18[0-9]{9}$/;
    /**
     * 1.验证器，可在应用程序中自行扩展以适用于应用场景；
     * 2.每个验证函数都应返回一个表示是否验证通过的布尔值；
     */
    var validator = Crab.validator = {
        /**
         * 验证一个字符串是否非空。
         */
        required: function (v) {
        	if (_isNullOrUndefined(v))
        		return false;
            return (v + '').trim() !== '';
        }
        /**
         * 验证一个非空字符串是否符合邮箱格式。（空字符串将通过验证）
         */
        , email: function (v) {
            if (!v) return true;
            return _reg_email.test(v + '');
        }
        /**
         * 验证一个非空字符串是否符合中国大陆地区手机号码格式。（空字符串将通过验证）
         */
        , phone: function (v) {
            if (!v) return true;
            return _reg_phone.test(v + '');
        }
    };

    
})(window);