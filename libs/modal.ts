// --------------------------------------------
// UI弹窗。
// @author: YuanYou
// --------------------------------------------

import { isNull, isObj, isUndef } from "./validation";

/**
 * 弹窗提示错误消息。
 * @param err 任何错误消息
 * @param options 弹窗选项，如果设置了`content`属性，则会前缀在错误消息之前。
 */
export function alertErrorMessage(err: Error | WechatMiniprogram.GeneralCallbackResult | string, options?: WechatMiniprogram.ShowModalOption) {
  let content = '程序出现错误。';
  if (!isNull(err) && !isUndef(err)) {
    if (err instanceof Error) {
      content = err.message;
    } else if (isObj(err)) {
      // @ts-ignore
      const msg = err.errMsg || err.message;
      msg && (content = msg);
    } else {
      content = err + '';
    }
  }
  const modalOpt: WechatMiniprogram.ShowModalOption = { content, success(){} };
  if (isObj(options)) {
    options?.content && (options.content += content);
    Object.assign(modalOpt, options);
  }
  wx.showModal(modalOpt);
}
