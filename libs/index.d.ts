/** 自定义App配置信息。 */
interface AppConfig {
  /** 环境状态。 */
  env?: 'dev' | 'prod',
  /** 小程序App名称。 */
  appName?: string,
  /** 网络相关。 */
  http?: {
    /** 请求时的默认超时时间（毫秒）。 */
    requestTimeout?: number;
    /** 请求接口。 */
    request?: { [apiName: string]: string },
    /** 下载默认超时时间（毫秒）。 */
    // downloadTimeout?: number,
    /** 下载域名或地址。 */
    download?: { [hostName: string]: string },
    /** 上传默认超时时间（毫秒）。 */
    // uploadTimeout?: number,
    /** 上传服务器域名或地址。 */
    upload?: { [hostName: string]: string },
    /** WebSocket服务器域名或地址。 */
    webSocket?: { [hostName: string]: string },
  },
  /** 内嵌webview配置，方便一览查看使用的业务域名。 */
  webviews?: Record<string, string>,
  /** 其他自定义配置。 */
  custom?: Record<string, any>
}

/** HTTP请求异步任务。 */
type RequestPromise<T extends WechatMiniprogram.RequestOption['data']> = Promise<T> & Pick<WechatMiniprogram.RequestTask, 'abort'>;
/** 文件上传异步任务。 */
type UploadPromise<T> = Promise<T> & Pick<WechatMiniprogram.UploadTask, 'abort'>;
/** 文件下载异步任务。 */
type DownloadPromise<T> = Promise<T> & Pick<WechatMiniprogram.DownloadTask, 'abort'>;

/** 可标记是否已处理的错误。 */
interface HandledError extends Error {
  /** 该错误是否已处理。 */
  handled: boolean;
  /** 兼容微信SDK的失败或错误消息（同 `Error.message`）。 */
  errMsg: string;
}

interface WxCallbacks {
  success?: (res: any) => void;
  fail?: (err: any) => void;
  complete?: (res: any) => void;
}
interface WxOption extends WxCallbacks {
  [x: string]: any;
}
/** 从指定类型中排除微信回调函数选项（success, fail, complete）。 */
type OmitWxCallbacks<T extends WxOption> = Omit<T, keyof WxCallbacks>;
