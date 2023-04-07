// --------------------------------------------
// 百度云人脸注册及验证的控制参数枚举。
// @author: YuanYou
// --------------------------------------------

/**
 * 人脸图像文件类型
 */
export enum FaceImageType {
  /** 图片的base64值，base64编码后的图片数据，编码后的图片大小不超过2M */
  BASE64 = 'BASE64',
  /** 图片的 URL地址( 可能由于网络等原因导致下载图片时间过长) */
  URL = 'URL',
  /**
   * 人脸图片的唯一标识，调用人脸检测接口时，会为每个人脸图片赋予一个唯一的FACE_TOKEN，
   * 同一张图片多次检测得到的FACE_TOKEN是同一个
   */
  FACE_TOKEN = 'FACE_TOKEN'
};

/**
* 人脸场景
*/
export enum FaceType {
  /** 表示生活照：通常为手机、相机拍摄的人像图片、或从网络获取的人像图片等 */
  LIVE = 'LIVE',
  /** 表示身份证芯片照：二代身份证内置芯片中的人像照片 */
  IDCARD = 'IDCARD',
  /** 表示带水印证件照：一般为带水印的小图，如公安网小图 */
  WATERMARK = 'WATERMARK',
  /** 表示证件照片：如拍摄的身份证、工卡、护照、学生证等证件图片 */
  CERT = 'CERT'
};

/**
* 图片质量控制。
* 若图片质量不满足要求，则返回结果中会提示质量检测失败
*/
export enum FaceQuality {
  /** 不进行控制 */
  NONE = 'NONE',
  /** 较低的质量要求 */
  LOW = 'LOW',
  /** 一般的质量要求 */
  NORMAL = 'NORMAL',
  /** 较高的质量要求 */
  HIGH = 'HIGH'
};

/**
* 活体检测控制
*/
export enum FaceLiveness {
  /** 不进行控制 */
  NONE = 'NONE',
  /** 较低的活体要求(高通过率 低攻击拒绝率) */
  LOW = 'LOW',
  /** 一般的活体要求(平衡的攻击拒绝率, 通过率) */
  NORMAL ='NORMAL',
  /** 较高的活体要求(高攻击拒绝率 低通过率) */
  HIGH = 'HIGH'
};

/**
* 人脸库注册方式
*/
export enum FaceRegisterType {
  /** 当user_id在库中已经存在时，对此user_id重复注册时，新注册的图片默认会追加到该user_id下 */
  APPEND = 'APPEND',
  /** 当对此user_id重复注册时,则会用新图替换库中该user_id下所有图片 */
  REPLACE = 'REPLACE'
};