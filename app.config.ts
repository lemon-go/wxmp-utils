const config: AppConfig = {
  env: 'dev',
  appName: 'MP-Utils',
  http: {
    request: {
      /** 百度云AI接口 */
      bdface: 'https://aip.baidubce.com'
    },
    upload: {
      /** 七牛云文件上传地址。 */
      qiniu: 'https://upload-z2.qiniup.com'
    },
    download: {
      /** 七牛云文件访问地址。 */
      qiniu: 'http://qiniuyun.handongchina.com'
    }
  },
  webviews: {
    /** 关于我们：官网地址 */
    orgWebsite: 'https://www.handongchina.com'
  },
  custom: {
    /** 关于我们：联系电话 */
    orgPhone: '028-65518800',
    /** 关于我们：公司名称 */
    orgName: 'xxx',
    /** 百度人脸识别 */
    bdface: { apiKey: 'xxx', secretKey: 'xxx' }
  }
}

export default config;