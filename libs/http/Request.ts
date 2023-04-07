// --------------------------------------------
// HTTP请求。
// @author: YuanYou
// --------------------------------------------

import HandledError from "../error/HandledError";
import Interceptor from "../Interceptor";
import { extend } from "../object";
import { isObj } from "../validation";

interface IExtendedRequestConfig {
  /** 公共请求域名。 */
  baseURL?: string;
  /** 加载时是否显示加载等待框，默认`false`。 */
  showLoading?: boolean;
  /** 加载时显示加载等待框的延时时间（默认`150`毫秒），即开始加载多少毫秒后仍未返回结果时即显示等待框。 */
  showLoadingDelay?: number;
  /** 加载等待框提示语，默认`加载中`。 */
  loadingTitle?: string;
  /** 加载等待框是否显示透明蒙层，防止触摸穿透，默认`false`。 */
  loadingMask?: boolean;
}
export type RequestConfig = OmitWxCallbacks<WechatMiniprogram.RequestOption> & IExtendedRequestConfig;
type RequestConfigOptinalUrl = Omit<RequestConfig, 'url'> & { url?: string };
export type GlobalRequestConfig = RequestConfigOptinalUrl;

export default class ScopeRequest {
  private scopeConfig?: RequestConfigOptinalUrl;
  private _reqInterceptors?: Interceptor<RequestConfig>;
  private _resInterceptors?: Interceptor<{ response: WechatMiniprogram.RequestSuccessCallbackResult, request: RequestConfig }, any>;
  /** 临时的请求混入参数，使用一次后立即失效。 */
  private tmpConfig?: RequestConfigOptinalUrl;

  constructor(globalConfig?: GlobalRequestConfig) {
    this.scopeConfig = globalConfig;
  }

  /**
   * 获取请求拦截器容器，可注册多个拦截器（具体用法参考 Middleware 中间件）。
   */
  public get requestInterceptors() {
    if (!this._reqInterceptors) {
      this._reqInterceptors = new Interceptor();
    }
    return this._reqInterceptors;
  }

  /**
   * 获取响应拦截器容器，可注册多个拦截器（具体用法参考 Middleware 中间件）。
   */
  public get responseInterceptors() {
    if (!this._resInterceptors) {
      this._resInterceptors = new Interceptor();
    }
    return this._resInterceptors;
  }

  // public withLoading(title: string,): ScopeRequest;
  // public withLoading(title: string, delay: number): ScopeRequest;
  // public withLoading(title: string, delay: number, mask: boolean): ScopeRequest;
  /**
   * 在接下来的一次请求中使用或取消等待框（消费后立即失效，该设置优先级仅低于请求方法中参数配置且高于全局配置）。
   * @param title 等待框标题；或者是否显示等待框的布尔值，为`true`时等待框标题为默认值且后续参数有效，为`false`时不显示等待框。
   * @param delay 同`GlobalRequestConfig['showLoadingDelay']`，默认`150`
   * @param mask 同`GlobalRequestConfig['loadingMask']`，默认`false`
   */
  public useLoading(title?: boolean | GlobalRequestConfig['loadingTitle'], delay?: GlobalRequestConfig['showLoadingDelay'], mask?: GlobalRequestConfig['loadingMask']) {
    let loadingTitle: string | undefined;
    if (typeof title === 'boolean') {
      if (!title) return this.use({ showLoading: false });
    } else {
      loadingTitle = title;
    }
    return this.use({
      showLoading: true,
      loadingTitle,
      showLoadingDelay: delay,
      loadingMask: mask
    });
  }

  /** 仅在接下来的一次请求中使用指定配置，消费后立即失效，该设置优先级仅低于请求方法中参数配置且高于全局配置。 */
  public use(config: GlobalRequestConfig): ScopeRequest {
    if (this.tmpConfig) {
      extend(true, this.tmpConfig, config);
    } else {
      this.tmpConfig = config;
    }
    return this;
  }

  /**
   * 向指定地址发送一个 GET 请求。
   * @param url 请求地址
   */
  public send<T>(url: string): RequestPromise<T>;
  /**
   * 发送请求。
   * @param option 请求配置选项
   */
  public send<T>(option: RequestConfig): RequestPromise<T>;
  /**
   * 发送请求。
   * @param url 请求地址
   * @param option 请求配置选项，其中的 `url` 属性会覆盖第一个参数
   */
  public send<T>(url: string, option: RequestConfigOptinalUrl): RequestPromise<T>;
  public send<T>(urlOrOption: string | RequestConfig, option?: RequestConfigOptinalUrl): RequestPromise<T> {
    const ctx = this;
    let config: WechatMiniprogram.RequestOption<T> & IExtendedRequestConfig;
    if (typeof urlOrOption === 'string') {
      config = extend(true, { url: urlOrOption }, defaultExtendedCfg, ctx.tmpConfig, option);
    } else {
      config = extend(true, {}, defaultExtendedCfg, ctx.tmpConfig, urlOrOption, option);
    }
    ctx.tmpConfig = undefined;
    // 合并当前请求实例的全局配置
    if (ctx.scopeConfig) {
      config = extend(true, {}, ctx.scopeConfig, config);
    }

    // 请求拦截器
    if (ctx._reqInterceptors) {
      config = ctx._reqInterceptors.invoke(config);
    }
    // 处理 url
    mergeUrl(config);

    // 发送请求
    let abort: (() => void) | null = null;
    const p: AnyObject = new Promise((resolve, reject) => {
      let _isLoading = true, _shownLoading = false;
      config.success = (res) => {
        if (ctx._resInterceptors) {
          resolve(ctx._resInterceptors.invoke({ response: res, request: config }));
        } else {
          resolve(res);
        }
      };
      config.fail = reject;
      config.complete = () => {
        _isLoading = false;
        if (_shownLoading) {
          _shownLoading = false;
          wx.hideLoading({ success(){} });
        }
      };
      const task = wx.request(config);
      abort = task.abort.bind(task);
      // showloading...
      config.showLoading && setTimeout(() => {
        _isLoading && wx.showLoading({
          title: config.loadingTitle!,
          mask: config.loadingMask,
          success() { _shownLoading = true; }
        });
      }, config.showLoadingDelay);
    });
    p.abort = abort;
    return p as RequestPromise<T>;
  }

  public get<T>(url: string): RequestPromise<T>;
  public get<T>(url: string, option: RequestConfigOptinalUrl): RequestPromise<T>;
  public get<T>(url: string, option?: RequestConfigOptinalUrl): RequestPromise<T> {
    const config = extend({}, option, { method: 'GET' });
    return this.send(url, config);
  }

  public delete<T>(url: string): RequestPromise<T>;
  public delete<T>(url: string, option: RequestConfigOptinalUrl): RequestPromise<T>;
  public delete<T>(url: string, option?: RequestConfigOptinalUrl): RequestPromise<T> {
    const config = extend({}, option, { method: 'DELETE' });
    return this.send(url, config);
  }

  public head<T>(url: string): RequestPromise<T>;
  public head<T>(url: string, option: RequestConfigOptinalUrl): RequestPromise<T>;
  public head<T>(url: string, option?: RequestConfigOptinalUrl): RequestPromise<T> {
    const config = extend({}, option, { method: 'HEAD' });
    return this.send(url, config);
  }

  public options<T>(url: string): RequestPromise<T>;
  public options<T>(url: string, option: RequestConfigOptinalUrl): RequestPromise<T>;
  public options<T>(url: string, option?: RequestConfigOptinalUrl): RequestPromise<T> {
    const config = extend({}, option, { method: 'OPTIONS' });
    return this.send(url, config);
  }

  public post<T>(url: string): RequestPromise<T>;
  public post<T>(url: string, data: string | AnyObject | ArrayBuffer): RequestPromise<T>;
  public post<T>(url: string, data: string | AnyObject | ArrayBuffer, option: RequestConfigOptinalUrl): RequestPromise<T>;
  public post<T>(url: string, data?: string | AnyObject | ArrayBuffer, option?: RequestConfigOptinalUrl): RequestPromise<T> {
    const config = extend(isObj(data), { data }, option, { method: 'POST' });
    // if (isObj(data)) {
    //   // 仅当 `data` 为对象时，才前后合并，否则直接使用配置对象中的数据
    //   config.data = extend(true, {}, data, config.data);
    // }
    return this.send(url, config);
  }

  public postJSON<T>(url: string): RequestPromise<T>;
  public postJSON<T>(url: string, data: string | AnyObject | ArrayBuffer): RequestPromise<T>;
  public postJSON<T>(url: string, data: string | AnyObject | ArrayBuffer, option: RequestConfigOptinalUrl): RequestPromise<T>;
  public postJSON<T>(url: string, data?: string | AnyObject | ArrayBuffer, option?: RequestConfigOptinalUrl): RequestPromise<T> {
    const config = extend(true, {}, option, { header: { 'Content-Type': 'application/json' } });
    return this.post(url, data!, config);
  }

  public put<T>(url: string): RequestPromise<T>;
  public put<T>(url: string, data: string | AnyObject | ArrayBuffer): RequestPromise<T>;
  public put<T>(url: string, data: string | AnyObject | ArrayBuffer, option: RequestConfigOptinalUrl): RequestPromise<T>;
  public put<T>(url: string, data?: string | AnyObject | ArrayBuffer, option?: RequestConfigOptinalUrl): RequestPromise<T> {
    const config = extend(isObj(data), { data }, option, { method: 'PUT' });
    // if (isObj(data)) {
    //   // 仅当 `data` 为对象时，才前后合并，否则直接使用配置对象中的数据
    //   config.data = extend(true, {}, data, config.data);
    // }
    return this.send(url, config);
  }

  public static send<T>(url: string): RequestPromise<WechatMiniprogram.RequestSuccessCallbackResult<T>>;
  /**
   * 发送请求。
   * @param option 请求配置选项
   */
  public static send<T>(option: RequestConfig): RequestPromise<WechatMiniprogram.RequestSuccessCallbackResult<T>>;
  /**
   * 发送请求。
   * @param url 请求地址
   * @param option 请求配置选项，其中的 `url` 属性会覆盖第一个参数
   */
  public static send<T>(url: string, option: RequestConfigOptinalUrl): RequestPromise<WechatMiniprogram.RequestSuccessCallbackResult<T>>;
  public static send<T>(urlOrOption: string | RequestConfig, option?: RequestConfigOptinalUrl): RequestPromise<WechatMiniprogram.RequestSuccessCallbackResult<T>> {
    return new ScopeRequest().send(urlOrOption as string, option as RequestConfigOptinalUrl);
  }
}

/** 默认的请求扩展配置。 */
const defaultExtendedCfg: IExtendedRequestConfig = {
  showLoading: false,
  showLoadingDelay: 150,
  loadingTitle: '加载中'
};

/** 处理请求URL。 */
function mergeUrl(config: RequestConfigOptinalUrl) {
  if (!config.url) throw new HandledError('[Request] 请求需要明确的地址 "url"。');
  if (!config.url.startsWith('https://') && !config.url.startsWith('http://')) {
    if (!config.baseURL) {
      throw new HandledError(`[Request] 请求地址 "${config.url}" 没有目标服务器 "baseURL"。`);
    }
    let urlJoinChar = '';
    if (config.url[0] !== '/' && !config.baseURL.endsWith('/')) {
      urlJoinChar = '/';
    }
    config.url = config.baseURL + urlJoinChar + config.url;
  }
}
