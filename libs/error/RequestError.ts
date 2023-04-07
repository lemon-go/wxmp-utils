// --------------------------------------------
// 请求错误类型。
// @author: YuanYou
// --------------------------------------------

import { RequestConfig } from "../http/Request";
import HandledError from "./HandledError";

/**
 * 请求错误。
 */
export default class RequestError extends HandledError {
  /** 引发此次请求错误的源信息。 */
  public source?: RequestConfig | string;
  /**
   * 创建一个新的请求错误。
   * @param message 请求错误消息。
   * @param source 引发此次请求错误的源信息。
   * @param handled 该错误是否已被处理，默认`false`。
   */
  public constructor(message: string, source?: RequestConfig | string, handled?: boolean) {
    // @ts-ignore
    super(message, handled);
    this.source = source;
    this.name = 'RequestError';
  }
}