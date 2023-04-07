// --------------------------------------------
// 分页控制。
// @author YuanYou
// --------------------------------------------

import HandledError from "./error/HandledError";
import { queueMicrotask } from "./task";

/** 分页控制。 */
export default class Pagination {
  /** 分页页码参数名称，默认为“pageIndex”。 */
  public pageIndexProp = 'pageIndex';
  /** 分页页大小参数名称，默认为“pageSize”。 */
  public pageSizeProp = 'pageSize';
  /** 加载时是否显示加载等待框，默认`true`。 */
  // public showLoading = true;
  /** 加载时显示加载等待框的延时时间（默认`150`毫秒），即开始加载多少毫秒后仍未返回结果时即显示等待框。 */
  // public showLoadingDelay = 150;
  /** 加载中提示语，默认“加载中”。 */
  // public loadingText = '加载中';
  /** 加载完成且没有下一页数据时的提示语，默认为“已加载全部”，为空则不提示。 */
  public loadCompleteTip = '已加载全部';
  /** 想要加载但没有下一页时的提示语，默认为“没有更多数据了”，为空则不提示。 */
  public noDataTip = '没有更多数据了';
  /** 当设置了`loader`后是否自动加载，默认`true`。 */
  public autoLoad = true;
  /** 请求数据的核心逻辑。返回值可以是表示是否有下一页数据的布尔值，也可以是实时数据的数量（通过计算判断是否有下一页）。 */
  public set loader(v: TPaginationLoader) {
    this._loader = v;
    this.autoLoad && queueMicrotask(() => {
      this.load();
    });
  }
  /** 获取是否有下一页数据。 */
  public get hasNextPage() { return this._hasNextPage; }
  /** 获取是否是第一页。 */
  public get isFirstPage() { return this.pageIndex === 1; }

  private _loader?: TPaginationLoader;
  /** 当前页码。 */
  private pageIndex = 1;
  /** 当前页大小。 */
  private pageSize = 20;
  /** 当前页是否已加载。 */
  private hasLoadCurrentPage = false;
  /** 是否正在请求数据。 */
  private isLoading = false;
  /** 是否有下一页数据。 */
  private _hasNextPage = true;
  /** 是否显示了等待框需要关闭。 */
  // private _shownLoading = false;

  public constructor();
  public constructor(options: IPaginationOptions);
    public constructor(options?: IPaginationOptions) {
    if (options) {
      options.pageIndexProp && (this.pageIndexProp = options.pageIndexProp);
      options.pageSizeProp && (this.pageSizeProp = options.pageSizeProp);
      (typeof options.pageSize === 'number' && options.pageSize > 0) && (this.pageSize = options.pageSize);
      (typeof options.autoLoad === 'boolean') && (this.autoLoad = options.autoLoad);
      // (typeof options.showLoading === 'boolean') && (this.showLoading = options.showLoading);
      // (typeof options.showLoadingDelay === 'number') && (this.showLoadingDelay = options.showLoadingDelay);
      (typeof options.loadCompleteTip === 'string') && (this.loadCompleteTip = options.loadCompleteTip);
      (typeof options.noDataTip === 'string') && (this.noDataTip = options.noDataTip);
      // options.loadingText && (this.loadingText = options.loadingText);
    }
  }

  /** 返回第一页，并重置分页及加载状态。 */
  public reset() {
    this.pageIndex = 1;
    this.hasLoadCurrentPage = false;
    this.isLoading = false;
    this._hasNextPage = true;
    // if (this._shownLoading) {
    //   this._shownLoading = false;
    //   wx.hideLoading({ success(){} });
    // }
    return this;
  }

  /** 设置下一次需要加载的页码。 */
  public setPageIndex(pageIndex: number) {
    if (pageIndex < 1) pageIndex = 1;
    if (pageIndex === 1) {
      return this.reset();
    }
    this.pageIndex = pageIndex;
    this.hasLoadCurrentPage = false;
    return this;
  }

  /** 设置下一次加载时的页大小。 */
  public setPageSize(pageSize: number) {
    pageSize > 0 && (this.pageSize = pageSize);
    return this;
  }

  /** 加载下一页数据，并返回是否有下一页数据。 */
  public load(): Promise<boolean>;
  /** 使用指定的请求逻辑加载下一页数据，并返回是否有下一页数据。 */
  public load(loader: TPaginationLoader): Promise<boolean>;
  public load(loader?: TPaginationLoader): Promise<boolean> {
    const ctx = this;
    if (!ctx._hasNextPage) {
      ctx.noDataTip && wx.showToast({ title: ctx.noDataTip, icon: 'none' });
      return Promise.reject(new HandledError('没有更多数据了。', true));
    }
    if (ctx.isLoading) {
      return Promise.reject(new HandledError('正在加载数据，已取消。', true));
    }
    const loadFn = loader || ctx._loader;
    if (!loadFn) throw new HandledError('未设置分页加载的请求函数。');
    ctx.isLoading = true;
    const pageIndex = ctx.hasLoadCurrentPage ? ++ctx.pageIndex : ctx.pageIndex;
    const pageSize = ctx.pageSize;
    const params = { [ctx.pageIndexProp]: pageIndex, [ctx.pageSizeProp]: pageSize };
    const task = loadFn(params).then(res => {
      let hasNextPage = false;
      if (typeof res === 'boolean') {
        hasNextPage = res;
      } else if (typeof res === 'object') {
        const setTotal = typeof res.total === 'number';
        const setCrtPagesize = typeof res.currentSize === 'number';
        if (!setTotal && !setCrtPagesize) {
          throw new HandledError('分页加载的请求函数的返回值不正确。');
        }
        ctx.hasLoadCurrentPage = true;
        if (setTotal) {
          hasNextPage = ((pageIndex - 1) * pageSize + res.currentSize) < res.total!;
        } else {
          hasNextPage = res.currentSize >= pageSize;
        }
      } else {
        throw new HandledError('分页加载的请求函数的返回值不正确。');
      }
      ctx._hasNextPage = hasNextPage;
      if (!hasNextPage && ctx.loadCompleteTip) {
        wx.showToast({ title: ctx.loadCompleteTip, icon: 'none', duration: 1000 });
      }
      return hasNextPage;
    }).catch((err) => {
      // 加载错误时，标记为未加载成功，下次加载时仍加载当前页
      ctx.hasLoadCurrentPage = false;
      throw err;
    });
    task.finally(() => {
      ctx.isLoading = false;
      // if (ctx._shownLoading) {
      //   ctx._shownLoading = false;
      //   wx.hideLoading({ success(){} });
      // }
    });
    // (ctx.showLoading && ctx.showLoadingDelay >= 0) && setTimeout(() => {
    //   if (ctx.isLoading) {
    //     wx.showLoading({ title: ctx.loadingText, success() { ctx._shownLoading = true } });
    //   }
    // }, ctx.showLoadingDelay);
    return task;
  }

  /**
   * 将页面滚动到指定位置。
   * @see [wx.pageScrollTo](https://developers.weixin.qq.com/miniprogram/dev/api/ui/scroll/wx.pageScrollTo.html)
   */
  public scrollTo(topOrSelector: number | string, options?: WechatMiniprogram.PageScrollToOption) {
    const opt: WechatMiniprogram.PageScrollToOption = {};
    if (typeof topOrSelector === 'number') {
      opt.scrollTop = topOrSelector;
    } else if (typeof topOrSelector === 'string') {
      opt.selector = topOrSelector;
    }
    options && Object.assign(opt, options);
    return wx.pageScrollTo(opt);
  }

  /**
   * 将页面滚动到页面顶部。
   * @see [wx.pageScrollTo](https://developers.weixin.qq.com/miniprogram/dev/api/ui/scroll/wx.pageScrollTo.html)
   */
  public scrollToTop(options?: WechatMiniprogram.PageScrollToOption) {
    return this.scrollTo(0, options);
  }
}

/** 分页请求数据的核心逻辑。 */
export type TPaginationLoader = (pagingParams: Record<string, any>) => Promise<TPaginationLoaderResult>;
/** 分页请求数据函数的返回值，可以是表示是否有下一页数据的布尔值，也可以是实时数据数量（通过计算判断是否有下一页）。 */
type TPaginationLoaderResult = boolean | {
  /** 所有数据总数，以此来计算是否还有下一页数据，不设置时则仅凭`currentSize`判断是否有下一页。建议尽可能设置，因该属性判断逻辑更严谨。 */
  total?: number;
  /** 当前页数据总数。如果未设置`total`且其小于当前页大小时，则视为没有下一页数据。 */
  currentSize: number;
};

interface IPaginationOptions {
  /** 分页页码参数名称，默认为`pageIndex`。 */
  pageIndexProp?: string;
  /** 分页页大小参数名称，默认为`pageSize`。 */
  pageSizeProp?: string;
  /** 分页页大小，默认`20`。 */
  pageSize?: number;
  /** 加载时是否显示加载等待框，默认`true`。 */
  // showLoading?: boolean;
  /** 加载时显示加载等待框的延时时间（默认`150`毫秒），即开始加载多少毫秒后仍未返回结果时即显示等待框。 */
  // showLoadingDelay?: number;
  /** 加载中提示语，默认`加载中`。 */
  // loadingText?: string;
  /** 加载完成且没有下一页数据时的提示语，默认为`已加载全部`，为空则不提示。 */
  loadCompleteTip?: string;
  /** 想要加载但没有下一页时的提示语，默认为`没有更多数据了`，为空则不提示。 */
  noDataTip?: string;
  /** 当设置了`loader`后是否自动加载，默认`true`。 */
  autoLoad?: boolean;
}
