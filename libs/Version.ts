// --------------------------------------------
// 版本号。
// 用于版本比较等操作。
// @author: YuanYou
// --------------------------------------------

type VersionLike = string | number | (number | string)[] | Version;

export default class Version {
  private _major = 0;
  private _minor = 0;
  private _revision = 0;
  private _build = 0;
  private _version = '';

  /** 主版本号 */
  public get major() { return this._major; }
  /** 次版本号 */
  public get minor() { return this._minor; }
  /** 修正版本号 */
  public get revision() { return this._revision; }
  /** 编译版本号 */
  public get build() { return this._build; }
  /** 版本号的字符串形式 */
  public get version() { return this._version; }

  private get _versionArray() {
    return [this.major, this.minor, this.revision, this.build];
  }

  public constructor();
  public constructor(version: VersionLike);
  public constructor(version?: VersionLike) {
    if (typeof version !== 'undefined') {
      this.setVersion(version);
    }
  }

  /**
   * 设置版本号。
   * @param version 版本号
   */
  public setVersion(version: VersionLike) {
    let verNumbers: number[];
    if (typeof version === 'string' || typeof version === 'number') {
      verNumbers = (version + '').split('.').map(n => +n);
    } else if (version instanceof Version) {
      verNumbers = version._versionArray;
    } else if (Array.isArray(version)) {
      verNumbers = version.map(n => +n);
    } else {
      throw new TypeError('[Version] Parameter version\'s type must be one of String, Number, Array<Number | String> or Version instance.');
    }
    const [major, minor, revision, build] = verNumbers;
    if (Number.isInteger(major)) this._major = major;
    if (Number.isInteger(minor)) this._minor = minor;
    if (Number.isInteger(revision)) this._revision = revision;
    if (Number.isInteger(build)) this._build = build;
    this._version = this._versionArray.join('.');
    return this;
  }

  /**
   * 与指定的版本号比较。
   * 如果比之大返回 `1`，小于返回 `-1`，等于返回 `0`。
   * @param version 需要比较的目标版本号
   */
  public compareWith(version: VersionLike): number {
    const targetArr = new Version(version)._versionArray;
    for (let i = 0, n1 = 0, n2 = 0; i < this._versionArray.length; i++) {
      n1 = this._versionArray[i];
      n2 = targetArr[i];
      if (n1 > n2) {
        return 1;
      } else if (n1 < n2) {
        return -1;
      }
    }
    return 0;
  }

  /**
   * 当前版本是否大于指定版本。
   * @param version 需要比较的目标版本号
   */
  public gt(version: VersionLike) {
    return this.compareWith(version) > 0;
  }
  /**
   * 当前版本是否大于或等于指定版本。
   * @param version 需要比较的目标版本号
   */
  public gte(version: VersionLike) {
    return this.compareWith(version) >= 0;
  }
  /**
   * 当前版本是否小于指定版本。
   * @param version 需要比较的目标版本号
   */
  public lt(version: VersionLike) {
    return this.compareWith(version) < 0;
  }
  /**
   * 当前版本是否小于或等于指定版本。
   * @param version 需要比较的目标版本号
   */
  public lte(version: VersionLike) {
    return this.compareWith(version) <= 0;
  }
  /**
   * 当前版本是否等于指定版本。
   * @param version 需要比较的目标版本号
   */
  public equal(version: VersionLike) {
    return this.compareWith(version) === 0;
  }

  /**
   * 获取微信 SDK 版本（客户端基础库版本）信息。
   */
  public static getWxSDKVersion() {
    return new Version(getWxVersion(true));
  }

  /**
   * 获取微信 App 版本信息。
   */
  public static getWXVerion() {
    return new Version(getWxVersion(false));
  }
}

let wxVersion: string;
let wxSDKVersion: string;
function getWxVersion(isSDK = false): string {
  if (!wxVersion || !wxSDKVersion) {
    const { version, SDKVersion } = wx.getAppBaseInfo();
    wxVersion = version;
    wxSDKVersion = SDKVersion;
  }
  return isSDK ? wxSDKVersion : wxVersion;
}