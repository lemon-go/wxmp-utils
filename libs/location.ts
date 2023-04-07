// --------------------------------------------
// 位置相关。
// @author: YuanYou
// --------------------------------------------

import config from "../libs/config";
import { requirePermission } from "./authorize";

let lastLocation: IlocationResult;
/**
 * 获取定位位置信息，如果定位失败则返回历史定位数据。
 * @param option 定位选项，可设置坐标系、精度控制以及权限控制等参数。
 */
export function getLocation(option: GetLocationOption): Promise<IlocationResult> {
  return requirePermission('scope.userLocation', option.allowGoSetting).then(() => {
    option.showLoading && wx.showLoading(option.showLoading);
    const t = wx.getLocation(option).then(lct => {
      lastLocation = lct;
      if (option.addressResolver) {
        return Promise.resolve(option.addressResolver(lct)).then(address => {
          lastLocation.address = address;
          return lastLocation;
        }).catch((err) => {
          config.isDev && console.warn('[Location] 逆地理位置解析时出现错误。', err);
          return lastLocation;
        });
      }
      return lastLocation;
    });
    option.showLoading && t.finally(() => wx.hideLoading());
    return t;
  }).catch(err => {
    if (lastLocation) return lastLocation;
    return Promise.reject(err);
  });
}

/** 经纬度位置。 */
export interface ILocationPostion {
  /** 纬度，范围为 -90~90，负数表示南纬 */
  latitude: number;
  /** 经度，范围为 -180~180，负数表示西经 */
  longitude: number;
}
/** 获取的位置信息。 */
type IlocationResult = WechatMiniprogram.GetLocationSuccessCallbackResult & {
  /** 地理位置，值为`addressResolver`的返回值。 */
  address?: string
}
type GetLocationOption = OmitWxCallbacks<WechatMiniprogram.GetLocationOption> & {
  /** 用户没有授权位置权限时，是否允许引导用户开启授权，默认 true。 */
  allowGoSetting?: boolean;
  /** 自定义的逆地理位置解析函数，不设置则返回的信息中不包含相关信息。 */
  addressResolver?: (location: ILocationPostion) => string | Promise<string>;
  /** 获取位置时需要显示等待框的定义选项。 */
  showLoading?: WechatMiniprogram.ShowLoadingOption;
}
