// --------------------------------------------
// 用户。用户身份和信息管理。
// @author: YuanYou
// --------------------------------------------

import HandledError from '../error/HandledError';
import * as storage from './storage';

export default class User<T extends AnyObject = AnyObject> {
  private _openid = '';
  private _openidInit = false;
  private _unionid = '';
  private _unionidInit = false;
  private _detail?: T;
  private _detailInit = false;
  /** 是否已检查用户登录session状态。 */
  private _hasCheckSession = false;
  /** 是否是访客用户（未和业务平台关联） */
  private _isGuest = true;

  /** 获取或设置是否使用异步批量存储用户信息。 */
  private useAsyncStore = true;
  
  /** 获取是否是访客用户，即未和业务平台关联，该值通过 `checkSession` 方法的返回值(`bindUser`)自行绑定。 */
  public get isGuest() { return this._isGuest; }
  
  /** 获取或设置用户 openid。 */
  public get openid() {
    if (!this._openidInit) {
      this._openid = storage.getOpenid();
      this._openidInit = true;
    }
    return this._openid;
  }
  public set openid(v) {
    if (v !== this._openid) {
      this._openid = v;
      this._openidInit = true;
      storage.setOpenid(v, this.useAsyncStore);
    }
  }

  /** 获取或设置用户 unionid。 */
  public get unionid() {
    if (!this._unionidInit) {
      this._unionid = storage.getUnionid();
      this._unionidInit = true;
    }
    return this._unionid;
  }
  public set unionid(v) {
    if (v !== this._unionid) {
      this._unionid = v;
      this._unionidInit = true;
      storage.setUnionid(v, this.useAsyncStore);
    }
  }

  /** 获取或设置用户自定义数据。 */
  public get detail() {
    if (!this._detailInit) {
      this._detail = storage.getUserDetail<T>();
      this._detailInit = true;
    }
    return this._detail;
  }
  public set detail(v) {
    if (v !== this._detail) {
      this._detail = v;
    }
    // 如果相同引用的引用数据类型仅修改内部属性，且赋值给自己时也同步缓存
    storage.setUserDetail(v, this.useAsyncStore);
    this._detailInit = true;
  }

  /**
   * 将用户详情同步到缓存数据中。
   * 当更改了用户详情 `detail` 中的属性值时才需要调用此方法同步。
   * @param useAsyncStore 是否使用异步批量存储，不传值则使用默认值
   */
  public storeDetail(useAsyncStore?: boolean) {
    let asyncStore = this.useAsyncStore;
    if (typeof useAsyncStore === 'boolean') {
      asyncStore = useAsyncStore;
    }
    storage.setUserDetail(this._detail, asyncStore);
  }

  /**
   * 检查用户登录状态，若没有登录会自动（微信）登录并绑定openid，将返回用户的 openid 以及是否绑定到平台用户的标识。
   * 可选择根据 openid 拉取平台用户信息或跳转到用户信息表单收集用户信息。
   * @param serverLogin 服务端微信登录和验证逻辑
   */
  public checkSession(serverLogin: ServerLoginHandler) {
    const checkSession = wx.checkSession();
    const checkOpenid = this.openid ? Promise.resolve(this.openid) : Promise.reject();
    return Promise.all([checkSession, checkOpenid]).then(([, openid]) => {
      // 微信session有效并且有微信openid，此时需要验证 openid 是否已关联平台用户
      return serverLogin({ openid });
    }, () => {
      // 未微信登录或session失效，或者没有 openid（可能缓存失效，需重新获取）
      return getOpenidAndUserState(serverLogin);
    }).then(res => {
      this.openid = res.openid;
      this._isGuest = !res.bindUser;
      res.unionid && (this.unionid = res.unionid);
      !this._hasCheckSession && (this._hasCheckSession = true);
      return res;
    });
  }

  /**
   * 使用微信 openid 登录服务端，并返回用户信息。
   * @param fetch 服务端登录接口
   */
  public login(fetch: ServerFetchUserHandler<T>) {
    if (!this._hasCheckSession) {
      throw new HandledError('还未验证当前用户身份状态，请先使用 checkSession 方法校验。');
    }
    if (!this.openid) {
      return Promise.reject(new HandledError('用户身份状态异常 (Unknown openid)。'));
    }
    return fetch(this.openid).then(userinfo => {
      this.detail = userinfo;
      return userinfo;
    });
  }

  /**
   * 登出并清除用户信息，仅保留用户的微信身份标识 (openid, unionid)。
   */
  public logout() {
    // this._openid = '';
    // this._openidInit = false;
    // this._unionid = '';
    // this._unionidInit = false;
    this._detail = undefined;
    this._detailInit = false;
    this._hasCheckSession = false;
    this._isGuest = true;
    return storage.clear().then(() => {});
  }

  /**
   * 从调用改方法开始，在当前实例上设置用户信息时，后台缓存数据使用同步存储。
   */
  public useSyncStore() {
    this.useAsyncStore = false;
  }

  /**
   * 从调用改方法开始，在当前实例上设置用户信息时，后台缓存数据使用异步批量存储。
   * 一般与 `User.useSyncStore` 成对使用。
   */
  public ejectSyncStore() {
    this.useAsyncStore = true;
  }
}

export type ServerLoginHandler = (arg: { wxLoginCode: string } | { openid: string }) => Promise<{ bindUser: boolean, openid: string ,/* session_key: string,*/ unionid?: string }>;
export type ServerFetchUserHandler<T> = (openid: string) => Promise<T>;

function getOpenidAndUserState(login: ServerLoginHandler) {
  return new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject
    })
  }).then(res => login({ wxLoginCode: res.code }))
}