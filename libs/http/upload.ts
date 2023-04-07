// ------------------------------------------
// 文件上传。
// @author: YuanYou
// ------------------------------------------

import HandledError from "../error/HandledError";

/** 上传文件。 */
export function uploadFile<T = string>(option: UploadOptions): UploadPromise<T> {
  let abort: (() => void);
  const p: any = new Promise<T>((resolve, reject) => {
    const opt: WechatMiniprogram.UploadFileOption = option;
    opt.success = function({ data, statusCode }) {
      if (statusCode >= 200 && statusCode < 300) {
        if (option.dataType === 'json') {
          try {
            return resolve(JSON.parse(data));
          } catch (_) {}
        }
        resolve(data as any as T);
      } else {
        reject(new HandledError(`上传失败，HTTP状态码(${ statusCode })。`));
      }
    };
    opt.fail = reject;
    opt.complete = function() {
      task.offProgressUpdate();
      task.offHeadersReceived();
    };
    const task = wx.uploadFile(opt);
    option.onProgressUpdate && task.onProgressUpdate(option.onProgressUpdate);
    option.onHeadersReceived && task.onHeadersReceived(option.onHeadersReceived);
    abort = task.abort.bind(task);
  });
  p.abort = abort!;
  return p as UploadPromise<T>;
}

/** 文件上传参数。 */
export type UploadOptions = OmitWxCallbacks<WechatMiniprogram.UploadFileOption>
 & {
   /** 监听上传进度变化事件的监听函数。 */
  onProgressUpdate?: WechatMiniprogram.UploadTaskOnProgressUpdateCallback,
  /** 监听 HTTP Response Header 事件的监听函数。会比请求完成事件更早。 */
  onHeadersReceived?: WechatMiniprogram.OnHeadersReceivedCallback
 }
 & {
   /** 文件上传成功后返回数据的格式，如果为`json`则会尝试进行JSON解析。默认`text`。 */
   dataType?: 'text' | 'json';
 };
