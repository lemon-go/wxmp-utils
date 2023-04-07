// --------------------------------------------
// 可标记是否已处理的错误类型。
// @author: YuanYou
// --------------------------------------------


/**
 * 可标记是否已处理的错误。
 */
export default class HandledError extends Error {
  /** 该错误是否已处理。 */
  public handled = false;
  /** 兼容微信SDK的失败或错误消息（同 `Error.message`）。 */
  public readonly errMsg: string;

  public constructor();
  /**
   * 创建一个新的错误。
   * @param message 错误消息。
   */
  public constructor(message: string); 
  /**
   * 创建一个新的错误。
   * @param message 错误消息。
   * @param handled 标记错误是否已被处理，默认 `false`。
   */
  public constructor(message: string, handled: boolean);
  public constructor(message?: string, handled?: boolean) {
    super(message);
    if (typeof handled === 'boolean') {
      this.handled = handled;
    }
    this.errMsg = (typeof message !== 'undefined') ? message : '';
    this.name = 'HandledError';
  }

  /** 标记错误已处理。 */
  public handle() {
    this.handled = true;
    return this;
  }

  /** 判断指定错误是否是在调用微信接口时，用户主动取消引发的错误。 */
  public static isCancelledError<T extends Pick<HandledError, 'errMsg'>>(err: T): boolean {
    let errMsg = '';
    if (typeof err === 'object' && typeof err.errMsg === 'string') {
      errMsg = err.errMsg;
    } else if (typeof err === 'string') {
      errMsg = err;
    } else {
      return false;
    }
    return errMsg.endsWith('fail cancel');
  }
}