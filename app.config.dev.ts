/**
 * 开发环境配置信息
 */
const config: AppConfig = {
  http: {
    request: {
      api: 'https://fjy.handongchina.com:9050'
    },
    webSocket: {
      im: 'https://fjy.handongchina.com:8002/chatHub'
    },
    // request: {
    //   api: 'http://132.232.253.210:9012'
    // },
    // webSocket: {
    //   im: 'http://132.232.253.210:8001/chatHub'
    // }
  }
}

export default config;