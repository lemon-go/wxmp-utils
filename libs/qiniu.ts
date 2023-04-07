// ------------------------------------------------------------------
// 七牛云存储。
// @see: https://developer.qiniu.com/kodo/1671/region-endpoint-fq
// @author: YuanYou
// ------------------------------------------------------------------

import HandledError from "./error/HandledError";
import { uploadFile, UploadOptions } from "./http/upload";

/**
 * 七牛云存储区域及接口地址。
 */
export const QiniuAreas: IQiniuAreas = {
  East: {
    areaId: 'z0',
    urlOfBucketManage: 'https://uc.qbox.me',
    urlOfFastUpload: 'https://upload.qiniup.com',
    urlOfUpload: 'https://up.qiniup.com',
    urlOfDownload: 'https://iovip.qbox.me',
    urlOfObjectManage: 'https://rs-z0.qiniuapi.com',
    urlOfObjectList: 'https://rsf-z0.qiniuapi.com',
    urlOfCountQuery: 'https://api.qiniuapi.com',
  },
  East2: {
    areaId: 'cn-east-2',
    urlOfBucketManage: 'https://uc.qbox.me',
    urlOfFastUpload: 'https://upload-cn-east-2.qiniup.com',
    urlOfUpload: 'https://up-cn-east-2.qiniup.com',
    urlOfDownload: 'https://iovip-cn-east-2.qiniuio.com',
    urlOfObjectManage: 'https://rs-cn-east-2.qiniuapi.com',
    urlOfObjectList: 'https://rsf-cn-east-2.qiniuapi.com',
    urlOfCountQuery: 'https://api.qiniuapi.com',
  },
  North: {
    areaId: 'z1',
    urlOfBucketManage: 'https://uc.qbox.me',
    urlOfFastUpload: 'https://upload-z1.qiniup.com',
    urlOfUpload: 'https://up-z1.qiniup.com',
    urlOfDownload: 'https://iovip-z1.qbox.me',
    urlOfObjectManage: 'https://rs-z1.qiniuapi.com',
    urlOfObjectList: 'https://rsf-z1.qiniuapi.com',
    urlOfCountQuery: 'https://api.qiniuapi.com',
  },
  Sounth: {
    areaId: 'z2',
    urlOfBucketManage: 'https://uc.qbox.me',
    urlOfFastUpload: 'https://upload-z2.qiniup.com',
    urlOfUpload: 'https://up-z2.qiniup.com',
    urlOfDownload: 'https://iovip-z2.qbox.me',
    urlOfObjectManage: 'https://rs-z2.qiniuapi.com',
    urlOfObjectList: 'https://rsf-z2.qiniuapi.com',
    urlOfCountQuery: 'https://api.qiniuapi.com',
  },
  NorthAmerica: {
    areaId: 'na0',
    urlOfBucketManage: 'https://uc.qbox.me',
    urlOfFastUpload: 'https://upload-na0.qiniup.com',
    urlOfUpload: 'https://up-na0.qiniup.com',
    urlOfDownload: 'https://iovip-na0.qbox.me',
    urlOfObjectManage: 'https://rs-na0.qiniuapi.com',
    urlOfObjectList: 'https://rsf-na0.qiniuapi.com',
    urlOfCountQuery: 'https://api.qiniuapi.com',
  },
  AsiaSingapore: {
    areaId: 'as0',
    urlOfBucketManage: 'https://uc.qbox.me',
    urlOfFastUpload: 'https://upload-as0.qiniup.com',
    urlOfUpload: 'https://up-as0.qiniup.com',
    urlOfDownload: 'https://iovip-as0.qbox.me',
    urlOfObjectManage: 'https://rs-as0.qiniuapi.com',
    urlOfObjectList: 'https://rsf-as0.qiniuapi.com',
    urlOfCountQuery: 'https://api.qiniuapi.com',
  },
  AsiaSeoul: {
    areaId: 'ap-northeast-1',
    urlOfBucketManage: 'https://uc.qbox.me',
    urlOfFastUpload: 'https://upload-ap-northeast-1.qiniup.com',
    urlOfUpload: 'https://up-ap-northeast-1.qiniup.com',
    urlOfDownload: 'https://iovip-ap-northeast-1.qiniuio.com',
    urlOfObjectManage: 'https://rs-ap-northeast-1.qiniuapi.com',
    urlOfObjectList: 'https://rsf-ap-northeast-1.qiniuapi.com',
    urlOfCountQuery: 'https://api.qiniuapi.com',
  },
}

/** 上传文件到七牛云存储。 */
export function upload<T = string>(option: QiniuUploadOption, tokenGenerator: UploadTokenGenerator) {
  if (!option || !tokenGenerator || !option.filePath || !option.url) {
    return Promise.reject(new HandledError('[qiniu] 参数错误，上传失败。'));
  }
  return Promise.resolve(tokenGenerator(option)).then(token => {
    const opt = option as UploadOptions;
    const form = opt.formData || (opt.formData = {});
    form['token'] = token;
    opt.name = 'file';
    return uploadFile<T>(opt);
  });
}

type QiniuUploadOption = Omit<UploadOptions, 'name'>;
type UploadTokenGenerator = (option: QiniuUploadOption) => string | Promise<string>;

interface IQiniuAreas {
  /** 华东-浙江(z0)。 */
  East: IQiniuAreaInfo;
  /** 华东-浙江2(cn-east-2)。 */
  East2: IQiniuAreaInfo;
  /** 华北-河北(z1)。 */
  North: IQiniuAreaInfo;
  /** 华南-广东(z2)。 */
  Sounth: IQiniuAreaInfo;
  /** 北美-洛杉矶(na0)。 */
  NorthAmerica: IQiniuAreaInfo;
  /** 亚太-新加坡(as0)。 */
  AsiaSingapore: IQiniuAreaInfo;
  /** 亚太-首尔	(ap-northeast-1)。 */
  AsiaSeoul: IQiniuAreaInfo;
}

interface IQiniuAreaInfo {
  /** 区域 Region ID。 */
  areaId: string;
  /** 空间管理地址。 */
  urlOfBucketManage: string;
  /** 加速上传地址。 */
  urlOfFastUpload: string;
  /** 源站上传地址。 */
  urlOfUpload: string;
  /** 源站下载地址。 */
  urlOfDownload: string;
  /** 对象管理地址。 */
  urlOfObjectManage: string;
  /** 对象列举地址。 */
  urlOfObjectList: string;
  /** 计量查询地址。 */
  urlOfCountQuery: string;
}