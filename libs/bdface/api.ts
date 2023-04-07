// --------------------------------------------
// 百度云人脸注册及验证API。
// @author: YuanYou
// --------------------------------------------

import RequestError from "../error/RequestError";
import ScopeRequest from "../http/Request";
import Store from "../Store";
import errorMap from "./api-errors";
import { FaceImageType, FaceQuality, FaceLiveness, FaceRegisterType, FaceType } from "./controls";

/** 获取百度云人脸AI功能使用的请求请求域。 */
export const requestDependency = {
  main: 'https://aip.baidubce.com'
};

/** 对比人脸图像并返回结果。 */
export function matchFaceset(face1: IFaceMatchInfo, face2: IFaceMatchInfo, apiKey: string, secretKey: string) {
  return getAccessToken(apiKey, secretKey).then(token => {
    const url = getFaceMatchApi(token);
    !face1.face_type && (face1.face_type = FaceType.LIVE);
    !face1.liveness_control && (face1.liveness_control = FaceLiveness.HIGH);
    !face1.quality_control && (face1.quality_control = FaceQuality.NORMAL);
    !face2.face_type && (face2.face_type = FaceType.LIVE);
    !face2.liveness_control && (face2.liveness_control = FaceLiveness.HIGH);
    !face2.quality_control && (face2.quality_control = FaceQuality.NORMAL);
    return getBdRequest().postJSON<IMainApiResultOfMatch>(url, JSON.stringify([face1, face2]));
  });
}

/** 注册人脸图像并返回图像信息。 */
export function registFaceset(face: IFaceRegistInfo, apiKey: string, secretKey: string) {
  return getAccessToken(apiKey, secretKey).then(token => {
    const url = getRegFacesetApi(token);
    !face.action_type && (face.action_type = FaceRegisterType.APPEND);
    !face.liveness_control && (face.liveness_control = FaceLiveness.HIGH);
    !face.quality_control && (face.quality_control = FaceQuality.NORMAL);
    return getBdRequest().postJSON<IMainApiResultOfRegistFaceset>(url, face);
  });
}

/** 获取AccessToken。 */
export function getAccessToken(apiKey: string, secretKey: string): Promise<string> {
  return getAccessTokenCache().then(token => token).catch(() => {
    return ScopeRequest.send<IAccessTokenResult>({
      url: getAccessTokenApi(apiKey, secretKey),
      method: 'POST',
    }).then(({ data, statusCode }) => {
      if (statusCode >= 200 && statusCode < 300) {
        if (data && typeof data.access_token === 'string') {
          // 过期时间在原基础上减去一天，防止百度服务器提前过期
          setAccessTokenCache(data.access_token, Date.now() + (data.expires_in * 1000) - 86400000);
          return data.access_token;
        }
        return Promise.reject(new RequestError(`人脸检测服务初始化失败（${data.error + ', ' + data.error_description}）。`));
      }
      return Promise.reject(new RequestError(`人脸检测服务初始化失败（GET_ACCESS_TOKEN:${statusCode}）。`));
    });
  });
}

/** 获取注册人脸库的api地址。 */
function getRegFacesetApi(accessToken: string) {
  return `/rest/2.0/face/v3/faceset/user/add?access_token=${accessToken}`;
}
/** 获取人脸对比的api地址。 */
function getFaceMatchApi(accessToken: string) {
  return `/rest/2.0/face/v3/match?access_token=${accessToken}`;
}
/** 获取百度云Access-Token的api地址。 */
function getAccessTokenApi(apiKey: string, secretKey: string) {
  return requestDependency.main + `/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
}
/** access-token缓存管理器。 */
let _tokenStore: Store<IAccessTokenCache, true>;
function _getTokenStore() {
  if (!_tokenStore) {
    _tokenStore = Store.create<IAccessTokenCache, true>({ storage: true, storageKey: '_BAIDU_FACE_ACCESSTOKEN_' });
  }
  return _tokenStore;
}
/** 缓存access-token。 */
function setAccessTokenCache(accessToken: string, expire: number) {
  const store = _getTokenStore();
  store.set('accessToken', accessToken);
  store.set('expire', expire);
}
/** 获取有效的access-token。 */
function getAccessTokenCache(): Promise<string> {
  const store = _getTokenStore();
  const token = store.get('accessToken');
  const expire = store.get('expire');
  if (token && expire && Date.now() < expire) {
    return Promise.resolve(token);
  }
  return Promise.reject();
}
let _bdRequest: ScopeRequest;
/** 获取百度云接口请求实例。 */
function getBdRequest(): ScopeRequest {
  if (_bdRequest) return _bdRequest;
  _bdRequest = new ScopeRequest({ baseURL: requestDependency.main });
  _bdRequest.responseInterceptors.add(({ response: res, request: req }) => {
    const data = res.data as IMainApiResult;
    if (typeof data === 'object' && typeof data.error_code === 'number') {
      if (data.error_code === 0) {
        return data.result;
      }
      return Promise.reject(new RequestError(errorMap[data.error_code] + `(${data.error_code}:${data.error_msg})`, req));
    }
    return Promise.reject(new RequestError('[BDFACE] 请求失败。', req));
  });
  return _bdRequest;
}

/**
 * Access-Token接口返回值。
 * ```js
 * {
 *   "refresh_token": "25.b55fe1d287227ca97aab219bb249b8ab.315360000.1798284651.282335-8574074",
 *   "expires_in": 2592000,
 *   "scope": "public wise_adapt",
 *   "session_key": "9mzdDZXu3dENdFZQurfg0Vz8slgSgvvOAUebNFzyzcpQ5EnbxbF+hfG9DQkpUVQdh4p6HbQcAiz5RmuBAja1JJGgIdJI",
 *   "access_token": "24.6c5e1ff107f0e8bcef8c46d3424a0e78.2592000.1485516651.282335-8574074",
 *   "session_secret": "dfac94a3489fe9fca7c3221cbf7525ff",
 *   // 获取失败或包含如下字段：
 *   "error": "invalid_client",
 *   "error_description": "unknown client id / Client authentication failed"
 * }
 * ```
 */
interface IAccessTokenResult {
  // refresh_token: string;
  /** Access-Token的有效期(秒为单位，一般为1个月) */
  expires_in: number;
  // scope: string;
  /** Access-Token */
  access_token: string;
  // session_key: string;
  // session_secret: string;
  /** Access-Token获取失败时的错误。 */
  error: string;
  /** Access-Token获取失败时的错误描述。 */
  error_description: string;
}
/** Access-Token缓存信息。 */
interface IAccessTokenCache {
  /** access-token */
  accessToken: string;
  /** 过期时间（毫秒） */
  expire: number;
}
/**
 * 百度云人脸注册、对比接口返回值。
 * ```json
 * {
 *  "error_code": 0,
 *  "error_msg": "SUCCESS",
 *  "log_id": 8910100179201,
 *  "timestamp": 1584869741,
 *  "cached": 0,
 *  "result": {}
 * ```
 */
interface IMainApiResult {
  /** 错误码。接口调用成功为`0`。 */
  error_code: number;
  /** 错误消息。 */
  error_msg: string;
  // log_id: 8910100179201,
  // timestamp: 1584869741,
  // cached: 0,
  result: Record<string, any>;
}
/**
 * 人脸注册接口返回值。
 * ```json
 * {
 *   "face_token": "008e1cc0f45e95edefa33c8f13f3d246",
 *   "location": {
 *     "left": 62.33,
 *     "top": 98.11,
 *     "width": 139,
 *     "height": 150,
 *     "rotation": 0
 *   }
 * }
 * ```
 */
interface IMainApiResultOfRegistFaceset {
  face_token: string;
  location: {
    left: number;
    top: number;
    width: number;
    height: number;
    rotation: number;
  }
}
/** 人脸注册需要的信息。 */
interface IFaceRegistInfo {
  /** 人脸图像信息。 */
  image: string;
  /** 人脸图像类型。 */
  image_type: FaceImageType;
  /** 注册的人脸划分的人脸库分组id。 */
  group_id: string;
  /** 注册的人脸id。 */
  user_id: string;
  /** 图片质量要求，默认`FaceQuality.NORMAL`。 */
  quality_control?: FaceQuality;
  /** 图片活体检测要求，默认`FaceLiveness.HIGH`。 */
  liveness_control?: FaceLiveness;
  /** 用户已存在人脸图像时的注册方式，默认`FaceRegisterType.APPEND`。 */
  action_type?: FaceRegisterType;
}
/** 人脸对比控制选项。 */
interface IFaceMatchInfo {
  /** 人脸图像信息。 */
  image: string;
  /** 人脸图像类型。 */
  image_type: FaceImageType;
  /** 人脸场景类型，默认`FaceType.LIVE`。 */
  face_type?: FaceType,
  /** 图片质量要求，默认`FaceQuality.NORMAL`。 */
  quality_control?: FaceQuality;
  /** 图片活体检测要求，默认`FaceLiveness.HIGH`。 */
  liveness_control?: FaceLiveness;
}
/** 人像对比结果。 */
interface IMainApiResultOfMatch {
  /** 人脸相似度得分（0-100），推荐阈值80。 */
  score: number;
  /** 人脸信息列表。 */
  face_list: Array<{ face_token: string }>;
}