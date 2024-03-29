import { PromiseCancel, Resolve } from "../type/task";

/**
 * 将一个promise转换为一个可取消的promise
 * @param {Promise} task 希望被转换的promise实例
 * @returns {Promise} 返回具有cancel()&isCancel()的promise对象
 */
export const TaskCancelable = (task: Promise<any>) => {
  let _reject: Resolve;
  let isCancel = false;
  const _status = Symbol("cancel");
  const cancelP = new Promise((resolve, reject) => {
    _reject = reject;
  });
  const p = Promise.race([task, cancelP]) as PromiseCancel;
  /***
   * 调用cancel时可能promise状态已经变为成功,
   * 所以不能在cancel里面改变isCancel
   * 只有catch的原因是cancel才代表被取消成功了
   */
  p.catch((reason) => {
    if (reason === _status) {
      isCancel = true;
    }
  });

  p.cancel = () => {
    _reject(_status);
    return p;
  };
  p.isCancel = () => {
    return isCancel;
  };
  return p;
};
