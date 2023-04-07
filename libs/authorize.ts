// --------------------------------------------
// 授权相关。
// @author: YuanYou
// --------------------------------------------

import HandledError from "./error/HandledError";

/**
 * 请求权限，并可指定不打开设置页引导用户开启授权。
 * @param scope 权限scope。
 * @param allowGoSetting 是否允许引导用户开启授权，默认 `true`。
 */
export function requirePermission(scope: WxScopes, allowGoSetting = true) {
  return wx.authorize({ scope }).then(() => {
    // 已授权
  }).catch((err: WechatMiniprogram.GeneralCallbackResult) => {
    if (allowGoSetting) {
      return new Promise<void>((resolve, reject) => {
        wx.showModal({
          title: '请求权限',
          content: '需要你授权相关权限才能正常使用该功能，是否前往授权？',
          confirmText: '前往授权',
          success(modal) {
            if (modal.confirm) {
              wx.openSetting({
                success(setting: WechatMiniprogram.OpenSettingSuccessCallbackResult) {
                  const hasPermission = setting.authSetting[scope as keyof WechatMiniprogram.AuthSetting];
                  if (hasPermission) {
                    resolve();
                  } else {
                    reject(new HandledError('未授权。'));
                  }
                },
                fail(err: WechatMiniprogram.GeneralCallbackResult) {
                  return reject(new HandledError(err.errMsg));
                }
              });
            } else {
              return reject(new HandledError('取消授权。'));
            }
          },
          fail(err: WechatMiniprogram.GeneralCallbackResult) {
            return reject(new HandledError(err.errMsg));
          }
        });
      });
    } else {
      return Promise.reject(new HandledError(err.errMsg));
    }
  });
}

type WxScopes = 
  | 'scope.userLocation'
  | 'scope.userFuzzyLocation'
  | 'scope.userLocationBackground'
  | 'scope.record'
  | 'scope.camera'
  | 'scope.bluetooth'
  | 'scope.writePhotosAlbum'
  | 'scope.addPhoneContact'
  | 'scope.addPhoneCalendar'
  | 'scope.werun'
  | 'scope.userInfo';
