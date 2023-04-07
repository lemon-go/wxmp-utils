var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var _a;
/**
 * 兼容 Uni app 平台的 WebSocket 连接实现。
 * @author Fred Yuan
 * @see uni-doc https://uniapp.dcloud.io/api/request/websocket
 *              https://github.com/dcloudio/uni-app/blob/master/src/core/service/api/network/socket.js
 */
export var UniWebSocket = (_a = /** @class */ (function () {
        function UniSocket(url, protocols, options) {
            var _a;
            var _this = this;
            this.binaryType = "blob";
            this.onclose = null;
            this.onerror = null;
            this.onmessage = null;
            this.onopen = null;
            this._url = url;
            // tslint:disable-next-line:variable-name
            var _protocols;
            if (typeof protocols === "string") {
                _protocols = [protocols];
            }
            else if (Array.isArray(protocols)) {
                _protocols = protocols;
            }
            var header = { "Content-Type": "application/json" };
            var connectOption = {
                url: url,
                header: header,
                method: "GET",
                protocols: _protocols,
                success: function (res) {
                    console.log("[UniWebSocket] uni.connectSocket invoke success.", res);
                },
                fail: function (err) {
                    console.error("[UniWebSocket] uni.connectSocket invoke faild.", err);
                },
            };
            if (typeof options === "object") {
                if (typeof options.header === "object") {
                    connectOption.header = __assign({}, header, options.header);
                }
                else if (typeof options.headers === "object") {
                    connectOption.header = __assign({}, header, options.headers);
                }
                if (typeof options.method === "string") {
                    connectOption.method = options.method.toUpperCase();
                }
                if (typeof options.protocols === "string") {
                    if (!connectOption.protocols) {
                        connectOption.protocols = [options.protocols];
                    }
                    else {
                        connectOption.protocols.push(options.protocols);
                    }
                }
                else if (Array.isArray(options.protocols)) {
                    if (!connectOption.protocols) {
                        connectOption.protocols = options.protocols;
                    }
                    else {
                        (_a = connectOption.protocols).push.apply(_a, options.protocols);
                    }
                }
            }
            var socket = uni.connectSocket(connectOption);
            this._socket = socket;
            socket.onOpen(function () {
                if (_this.onopen) {
                    var ev = { type: "open" };
                    _this.onopen(ev);
                    // this.onopen(new Event("open"));
                }
            });
            socket.onClose(function (reason) {
                if (_this.onclose) {
                    if (typeof reason === "object") {
                        reason.type = "close";
                    }
                    _this.onclose(reason);
                    // this.onclose(new CloseEvent("close", {
                    //     /** Warn: incorrect */
                    //     wasClean: true,
                    //     code: 1000,
                    // }));
                }
            });
            socket.onError(function () {
                if (_this.onerror) {
                    var ev = { type: "error" };
                    _this.onerror(ev);
                    // this.onerror(new Event("error"));
                }
            });
            socket.onMessage(function (result) {
                if (_this.onmessage) {
                    var ev = { type: "message", data: result.data };
                    _this.onmessage(ev);
                }
            });
        }
        Object.defineProperty(UniSocket.prototype, "url", {
            get: function () { return this._url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UniSocket.prototype, "bufferedAmount", {
            get: function () { return 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UniSocket.prototype, "extensions", {
            get: function () { return ""; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UniSocket.prototype, "protocol", {
            get: function () { return ""; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UniSocket.prototype, "readyState", {
            get: function () {
                return this._socket.readyState;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UniSocket.prototype, "CLOSED", {
            get: function () { return 3; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UniSocket.prototype, "CLOSING", {
            get: function () { return 2; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UniSocket.prototype, "OPEN", {
            get: function () { return 1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UniSocket.prototype, "CONNECTING", {
            get: function () { return 0; },
            enumerable: true,
            configurable: true
        });
        // tslint:disable-next-line:variable-name
        UniSocket.prototype.addEventListener = function (_type, _listener, _options) {
            /** empty-implements */
            throw new Error("UniWebSocket do not implement 'addEventListener' method.");
        };
        // public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        // tslint:disable-next-line:variable-name
        UniSocket.prototype.removeEventListener = function (_type, _listener, _options) {
            /** empty-implements */
            throw new Error("UniWebSocket do not implement 'removeEventListener' method.");
        };
        // public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
        // tslint:disable-next-line:variable-name
        UniSocket.prototype.dispatchEvent = function (_event) {
            /** empty-implements */
            throw new Error("UniWebSocket do not implement 'dispatchEvent' method.");
            // return false;
        };
        UniSocket.prototype.close = function (code, reason) {
            this._socket.close({ code: code, reason: reason });
        };
        UniSocket.prototype.send = function (data) {
            data = data;
            this._socket.send({ data: data });
        };
        return UniSocket;
    }()),
    _a.CLOSED = 3,
    _a.CLOSING = 2,
    _a.OPEN = 1,
    _a.CONNECTING = 0,
    _a);
//# sourceMappingURL=UniWebSocket.js.map