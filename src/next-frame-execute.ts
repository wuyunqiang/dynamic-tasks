import { Resolve, Task } from "../type/task";

/**
 * 推迟到下一帧执行任务
 * 避免执行较多任务阻塞UI
 * requestAnimationFrame > setTimeout兼容
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
    // 浏览器兼容 确保推迟到下一帧
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Promise.resolve(task()).then(_resolve, _reject);
      })
    });
    return p;
  }

  setTimeout(() => {
    Promise.resolve(task()).then(_resolve, _reject);
  }, 16);
  return p;
};
