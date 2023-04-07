var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { AbortError, HttpError, TimeoutError } from "./Errors";
import { HttpClient, HttpResponse } from "./HttpClient";
import { LogLevel } from "./ILogger";
var UniHttpClient = /** @class */ (function (_super) {
    __extends(UniHttpClient, _super);
    function UniHttpClient(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        return _this;
    }
    UniHttpClient.prototype.send = function (request) {
        // Check that abort was not signaled before calling send
        if (request.abortSignal && request.abortSignal.aborted) {
            return Promise.reject(new AbortError());
        }
        if (!request.method) {
            return Promise.reject(new Error("No method defined."));
        }
        if (!request.url) {
            return Promise.reject(new Error("No url defined."));
        }
        var self = this;
        return new Promise(function (resolve, reject) {
            var conf = {
                url: request.url,
                data: request.content,
                method: (request.method || "GET").toUpperCase(),
                withCredentials: request.withCredentials === undefined ? true : request.withCredentials,
                header: __assign({ 
                    // Tell auth middleware to 401 instead of redirecting
                    "X-Requested-With": "XMLHttpRequest", "Content-Type": "application/x-www-form-urlencoded" }, (request.headers || {})),
                responseType: request.responseType || "text",
                dataType: "text",
                timeout: request.timeout,
            };
            conf.success = function (_a) {
                var data = _a.data, statusCode = _a.statusCode;
                if (request.abortSignal) {
                    request.abortSignal.onabort = null;
                }
                if (statusCode >= 200 && statusCode < 300) {
                    var dataType = typeof data;
                    var dataString = "";
                    if (data instanceof ArrayBuffer) {
                        dataString = utf8ArrayToString(new Int32Array(data));
                    }
                    else if (dataType !== "string" && dataType !== "undefined") {
                        dataString = JSON.stringify(data);
                    }
                    else if (data) {
                        dataString = data + "";
                    }
                    resolve(new HttpResponse(statusCode, "OK", dataString));
                }
                else {
                    var errorMessage = "(UniHttpClient) Request success, but status code is " + statusCode;
                    self.logger.log(LogLevel.Error, errorMessage);
                    reject(new HttpError(errorMessage, statusCode));
                }
            };
            conf.fail = function (_a) {
                var errMsg = _a.errMsg;
                self.logger.log(LogLevel.Error, "(UniHttpClient) Request failed, message: " + errMsg + ".");
                var err;
                if ((errMsg + "").toUpperCase().indexOf("TIMEOUT") !== -1) {
                    err = new TimeoutError(errMsg);
                }
                else {
                    err = new HttpError(errMsg, -1);
                }
                reject(err);
            };
            if (request.abortSignal) {
                request.abortSignal.onabort = function () {
                    if (reqTask) {
                        reqTask.abort();
                    }
                    reject(new AbortError());
                };
            }
            var reqTask = uni.request(conf);
        });
    };
    return UniHttpClient;
}(HttpClient));
export { UniHttpClient };
function utf8ArrayToString(array) {
    var out = "";
    var i = 0;
    var len = array.length;
    var c;
    var char2;
    var char3;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
}
//# sourceMappingURL=UniHttpClient.js.map