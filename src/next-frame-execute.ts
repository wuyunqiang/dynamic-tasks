import { Resolve, Task } from "../type/task";

/**
 * 时间切片的方式运行任务
 * 避免执行较多任务阻塞UI
 * 使用MessageChannel > requestAnimationFrame > setTimeout兼容
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

  if (typeof MessageChannel !== 'undefined') {
    const channel = new MessageChannel(); // 建立宏任务的消息通道
    const port1 = channel.port1;
    const port2 = channel.port2;

    port2.onmessage = () => {
      Promise.resolve(task()).then(_resolve, _reject);
    }
    port1.postMessage('next')
    return p;
  }

  /**下一帧执行执行 
   * Any rAFs queued in your event handlers will be executed in the same frame.
   * Any rAFs queued in a rAF will be executed in the next frame
   * **/
  if (typeof requestAnimationFrame !== "undefined") {
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