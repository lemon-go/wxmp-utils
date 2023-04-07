// --------------------------------------------
// 基于SignalR的WebSocket服务。
// @author: YuanYou
// --------------------------------------------

import { HubConnection, HubConnectionBuilder, HubConnectionState } from "./signalr/index";
import config from "./config";
import Store from "./Store";


type ConnectionBuilder = (builder: HubConnectionBuilder) => HubConnection;
const CONNECTIONS = Store.create<{ [k: string]: HubConnection }>();

/** WebSocket连接管理器。 */
export default class WS {
  /** 当前 SignalR 连接对象。 */
  private connection?: HubConnection;
  /** 用于自定义 SignalR 连接的构造器。 */
  private build: ConnectionBuilder;
  /** 用于缓存连接的唯一标识符，同一个连接地址建议使用相同的标识。 */
  private cacheKey: string;

  /** 获取当前连接状态。 */
  public get state(): HubConnectionState {
    return this.connection ? this.connection.state : HubConnectionState.Disconnected;
  }

  /** 获取客户端是否已连接到服务器。 */
  public get connected() {
    return this.state === HubConnectionState.Connected;
  }

  /**
   * 创建一个WebSocket连接管理器。
   * @param connectionKey 用于缓存连接的唯一标识符，同一个连接使用相同的标识。
   * @param build 自定义SignalR连接的构造器。
   */
  public constructor(connectionKey: string, build: ConnectionBuilder) {
    this.cacheKey = connectionKey;
    this.build = build;
  }

  /** 当连接到服务器时，使用该方法确保连接可用。 */
  public ready(): Promise<HubConnection> {
    const hub = this.connection || (this.connection = this.getConnection());
    if (hub.state !== HubConnectionState.Connected) {
      return hub.start().then(() => hub).catch((err) => {
        config.isDev && console.error('[WS] 开启连接时出现错误。', err);
        return hub;
      });
    }
    return Promise.resolve(hub);
  }

  /** 断开连接。 */
  public stop(): Promise<void> {
    if (!this.connection) return Promise.resolve();
    return this.connection.stop();
  }

  private getConnection() {
    if (CONNECTIONS.get(this.cacheKey)) return CONNECTIONS.get(this.cacheKey);
    // const builder = new HubConnectionBuilder()
    // .withUrl(this.url, this.builderOptions);
    // .withAutomaticReconnect([0, 2000, 4000, 8000, 10000, 30000, 60000])
    // .configureLogging(config.isProduction ? LogLevel.None : LogLevel.Debug)
    // .build();
    const hub = this.build(new HubConnectionBuilder());
    hub.onclose(err => {
      config.isDev && console.error(`[WS: ${ hub.state }] SignalR 已断开连接。`, err);
    });
    hub.onreconnecting(cause => {
      config.isDev && console.warn(`[WS: ${ hub.state }] SignalR 正在尝试重连。`, cause);
    });
    hub.onreconnected(id => {
      config.isDev && console.info(`[WS: ${ hub.state }] SignalR 重连成功: ${ id }。`);
    });
    CONNECTIONS.set(this.cacheKey, hub);
    return hub;
  }

}
