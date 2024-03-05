export type IdleCallBackFnParams = {
  didTimeout: boolean;
  timeRemaining: () => number
}

export type IdleCallBackFn = (
  params: IdleCallBackFnParams) => void;

export type Options = {
  timeout: number;
}

const frameTime = Math.floor(1000 / 60); // 每帧运行的时间
/**
 * polyfill requestIdleCallBack
 * 当浏览器空闲时执行 避免阻塞主线程
 * 通过raf + 帧执行时间 获得一帧结束时间
 * 通过messageChannel使用宏任务让出主线程
 * @param callback 
 * @param params 
 * @returns 
 */
function idleExecute(callback: IdleCallBackFn, params?: Options) {
  const channel = new MessageChannel(); // 建立宏任务的消息通道
  const port1 = channel.port1;
  const port2 = channel.port2;
  const timeout = params?.timeout || -1;
  let cb: IdleCallBackFn | null = callback;
  let frameDeadlineTime = 0; // 当前帧结束的时间
  const begin = performance.now();
  let cancelFlag = 0;

  const runner = (timeStamp: number) => {
    // 获取当前帧结束的时间
    frameDeadlineTime = timeStamp + frameTime;
    if (cb) {
      port1.postMessage('task')
    }
  }
  port2.onmessage = () => {
    const timeRemaining = () => {
      const remain = frameDeadlineTime - performance.now();
      return remain > 0 ? remain : 0;
    };
    let didTimeout = false;
    if (timeout > 0) {
      didTimeout = performance.now() - begin > timeout;
    }
    // 没有可执行的回调 直接结束
    if (!cb) {
      return;
    }
    // 当前帧没有时间&没有超时 下次再执行
    if (timeRemaining() <= 1 && !didTimeout) {
      cancelFlag = requestAnimationFrame(runner);
      return;
    }
    //有剩余时间或者超时
    cb({
      didTimeout,
      timeRemaining,
    });
    cb = null;
  }
  cancelFlag = requestAnimationFrame(runner)
  return cancelFlag;
}

const cAction = () => {
  if (typeof cancelIdleCallback === 'function') {
    return cancelIdleCallback;
  }
  if (typeof cancelAnimationFrame === 'function') {
    return cancelAnimationFrame;
  }
  return () => ({})
}

export const cancelIdleCall = cAction();

const iAction = () => {
  if (typeof requestIdleCallback === 'function') {
    return requestIdleCallback;
  }
  return idleExecute;
}

export const idleCallback = iAction();