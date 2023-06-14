import { Resolve, Task } from "../type/task";

/**
 * 时间切片的方式运行任务
 * 避免执行较多任务阻塞UI
 * 优先使用requestAnimationFrame,否则使用setTimeout兼容
 * @param {Function} task
 * @returns {Promise}
 */
export const nextFrameExecute = async (task: Task) => {
    let _resolve: Resolve;
    let _reject: Resolve;
    const p = new Promise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => {
        Promise.resolve(task()).then(_resolve, _reject);
      });
      return p;
    }
    setTimeout(() => {
      Promise.resolve(task()).then(_resolve, _reject);
    }, 16);
    return p;
  };