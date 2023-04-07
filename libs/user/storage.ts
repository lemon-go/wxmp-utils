// --------------------------------------------
// 用户数据持久化。
// @author: YuanYou
// --------------------------------------------

import { queueMicrotask } from "../task";
import Version from "../Version";

const KEYOF_USER_OPENID = '_USER_OPENID_';
const KEYOF_USER_UNIONID = '_USER_UNIONID_';
// const KEYOF_USER_FACETOKEN = '_USER_FACETOKEN_';
// const KEYOF_USER_FACEBASE64 = '_USER_FACEBASE64_';
const KEYOF_USER_DETAIL = '_USER_DETAIL_';

export function clear() {
  const tasks = [
    // KEYOF_USER_OPENID,
    // KEYOF_USER_UNIONID,
    // KEYOF_USER_FACETOKEN,
    // KEYOF_USER_FACEBASE64,
    KEYOF_USER_DETAIL
  ].map(key => wx.removeStorage({ key }));
  return Promise.all(tasks);
}

export function getOpenid() {
  return wx.getStorageSync<string>(KEYOF_USER_OPENID);
}
export function setOpenid(openid: string, useAsyncBatchSetter: boolean) {
  if (useAsyncBatchSetter) {
    appendBatchSetter(KEYOF_USER_OPENID, openid);
  } else {
    // console.log('【User Storeage】setOpenid...')
    wx.setStorageSync(KEYOF_USER_OPENID, openid);
  }
}

export function getUnionid() {
  return wx.getStorageSync<string>(KEYOF_USER_UNIONID);
}
export function setUnionid(unionid: string, useAsyncBatchSetter: boolean) {
  if (useAsyncBatchSetter) {
    appendBatchSetter(KEYOF_USER_UNIONID, unionid);
  } else {
    // console.log('【User Storeage】setUnionid...')
    wx.setStorageSync(KEYOF_USER_UNIONID, unionid);
  }
}

// export function getFaceToken() {
//   return wx.getStorageSync<string>(KEYOF_USER_FACETOKEN);
// }
// export function setFaceToken(token: string, useAsyncBatchSetter: boolean) {
//   if (useAsyncBatchSetter) {
//     appendBatchSetter(KEYOF_USER_FACETOKEN, token);
//   } else {
//     wx.setStorageSync(KEYOF_USER_FACETOKEN, token);
//   }
// }

// export function getFaceBase64() {
//   return wx.getStorageSync<string>(KEYOF_USER_FACEBASE64);
// }
// export function setFaceBase64(base64: string, useAsyncBatchSetter: boolean) {
//   if (useAsyncBatchSetter) {
//     appendBatchSetter(KEYOF_USER_FACEBASE64, base64);
//   } else {
//     wx.setStorageSync(KEYOF_USER_FACEBASE64, base64);
//   }
// }

export function getUserDetail<T>() {
  return wx.getStorageSync<T>(KEYOF_USER_DETAIL);
}
export function setUserDetail<T>(userinfo: T, useAsyncBatchSetter: boolean) {
  if (useAsyncBatchSetter) {
    appendBatchSetter(KEYOF_USER_DETAIL, userinfo);
  } else {
    wx.setStorageSync(KEYOF_USER_DETAIL, userinfo);
  }
}



let batchSetter: Array<{ key: string, value: any }> | null = null;
function appendBatchSetter(key: string, value: any) {
  if (!batchSetter) {
    batchSetter = [];
    queueMicrotask(() => {
      if (!batchSetter || !batchSetter.length) return;
      // console.log('[User] 在这里一次性批量设置缓存数据（惰性）', JSON.stringify(batchSetter));
      const sdkVer = Version.getWxSDKVersion();
      const normalStore = function(kvlist: typeof batchSetter) {
        Promise.all(kvlist!.map(item => wx.setStorage({ key: item.key, data: item.value }))).then(() => {
          // console.info('[User Storage] 批量缓存（回退）成功。');
        }, (err: any) => {
          console.error('[User Storage] 批量缓存（回退）失败。', err);
        });
      };
      // @ts-ignore
      if (sdkVer.gte('2.25.0') && typeof wx.batchSetStorage === 'function') {
        const dataEntries = batchSetter.slice(0);
        // @ts-ignore
        wx.batchSetStorage({
          kvList: dataEntries
        }).then(() => {
          // console.info('[User Storage] 批量缓存成功。');
        }, (err: any) => {
          console.warn('[User Storage] 批量缓存失败：', err, '将尝试依次逐个存储...');
          normalStore(dataEntries);
        });
      } else {
        normalStore(batchSetter);
      }
      batchSetter = null;
    });
  }
  batchSetter.push({ key, value });
}