// --------------------------------------------
// 配置中心。
// @author: YuanYou
// --------------------------------------------

import { extend } from './object';
import baseConfig from '../app.config';
import devConfig from '../app.config.dev';
import prodConfig from '../app.config.prod';

/** App应用配置。 */
const config = getConfig();
export default config;

type MergedAppConfig = AppConfig & {
  /** 是否是生产（发布）环境。 */
  readonly isProd: boolean;
  /** 是否是开发环境。 */
  readonly isDev: boolean;
}

function getConfig(): MergedAppConfig {
  const envProp = 'env';
  if (Object.prototype.hasOwnProperty.call(devConfig, envProp)) delete devConfig[envProp];
  if (Object.prototype.hasOwnProperty.call(prodConfig, envProp)) delete prodConfig[envProp];
  if (baseConfig.env !== 'dev' && baseConfig.env !== 'prod') {
    baseConfig.env = 'dev';
  }
  const args = [true, {}, baseConfig, baseConfig.env === 'prod' ? prodConfig : devConfig];
  const config: AppConfig = extend.apply(null, args);
  const isProd = config.env === 'prod';
  const isDev = config.env === 'dev';
  return Object.assign(config, { get isProd(){ return isProd }, get isDev() { return isDev } });
}
