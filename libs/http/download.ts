// ------------------------------------------
// 文件下载。
// @author: YuanYou
// ------------------------------------------

import HandledError from "../error/HandledError";

/** 下载文件。 */
export function downloadFile(option: DownloadOptions): DownloadPromise<WechatMiniprogram.DownloadFileSuccessCallbackResult> {
  let abort: (() => void);
  const p: any = new Promise((resolve, reject) => {
    const opt: WechatMiniprogram.DownloadFileOption = option;
    opt.success = function(res) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve(res);
      } else {
        reject(new HandledError(`下载失败，HTTP状态码(${ res.statusCode })。`));
      }
    };
    opt.fail = reject;
    opt.complete = function() {
      task.offProgressUpdate();
      task.offHeadersReceived();
    };
    const task = wx.downloadFile(opt);
    option.onProgressUpdate && task.onProgressUpdate(option.onProgressUpdate);
    option.onHeadersReceived && task.onHeadersReceived(option.onHeadersReceived);
    abort = task.abort.bind(task);
  });
  p.abort = abort!;
  return p as DownloadPromise<WechatMiniprogram.DownloadFileSuccessCallbackResult>;
}

/** 文件下载参数。 */
export type DownloadOptions = OmitWxCallbacks<WechatMiniprogram.DownloadFileOption>
 & {
   /** 监听下载进度变化事件的监听函数。 */
  onProgressUpdate?: WechatMiniprogram.DownloadTaskOnProgressUpdateCallback,
  /** 监听 HTTP Response Header 事件的监听函数。会比请求完成事件更早。 */
  onHeadersReceived?: WechatMiniprogram.OnHeadersReceivedCallback
 };
