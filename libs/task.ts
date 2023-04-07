// --------------------------------------------
// 任务与微任务控制。
// @author: YuanYou
// --------------------------------------------

/**
 * 往微任务队列中插入一个待执行任务。
 * @param callback 微任务函数
 */
export function queueMicrotask(callback: () => void): void {
  Promise.resolve()
    .then(callback)
    .catch(err => setTimeout(() => { throw err; }));
};
