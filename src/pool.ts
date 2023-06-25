import { PoolList, Resolve, TaskRes } from '../type/task';
import workerStr from './worker'
let blob: Blob;
let url: string;
let threadPool: Worker[] = [];

/**
 * 使用webworker开启一个线程池 执行复杂运算
 * real parallel
 * @param list 任务列表
 * @param max 最大并发数 默认为2 最好和cpu数量一致 不要设置过多
 * @returns 返回一个promise
 */
export const pool = async (list: PoolList, max = 1) => {
  if (!blob) {
    blob = new Blob([workerStr], { type: 'text/plain' });
  }
  if (!url) {
    url = URL.createObjectURL(blob);
  }
  const store: { [key: string]: TaskRes } = {}
  let _resolve: Resolve;
  const p = new Promise((resolve) => {
    _resolve = resolve;
  })
  let doneCount = 0;
  let index = 0;
  const runner = (curWorker: Worker) => {
    const curIndex = index++;
    if (!curWorker || !list[curIndex]) {
      return;
    }
    const { key, task } = list[curIndex];
    curWorker.postMessage({
      key,
      task: `${task}`
    });
    curWorker.onmessage = function (event) {
      store[event.data.key] = event.data;
      doneCount++;
      if (doneCount === list.length) {
        _resolve(store)
        return;
      }
      runner(curWorker)
    }
    curWorker.onerror = function (event) {
      console.dir('test error', event)
    }
  }

  for (let i = 0; i < max; i++) {
    let worker = threadPool[i];
    if (!worker) {
      worker = new Worker(url)
      threadPool[i] = worker;
    }
    runner(worker)
  }
  return p
}

/**
 * clear thread pool
 */
export const clearPool = () => {
  threadPool.forEach(worker => {
    worker.terminate()
  })
  threadPool = [];
}

export default pool;