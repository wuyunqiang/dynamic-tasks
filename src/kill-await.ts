/* eslint-disable @typescript-eslint/no-explicit-any */
import { isPromiseLike } from "./promise-like";
let curCount = 0;
let map = new Map();
const promise = (callback: () => void) => {
  if (map.get(curCount)) {
    const res = map.get(curCount);
    curCount++;
    return res;
  }
  const p = new Promise(callback);
  throw p;
};

const run = (action: () => void) => {
  try {
    action();
  } catch (error) {
    if (!isPromiseLike(error)) {
      throw error;
    }
    (error as any)
      .then((res: any) => {
        map.set(curCount, res);
      })
      .catch((err: any) => {
        map.set(curCount, err);
      })
      .finally(() => {
        curCount = 0;
        run(action);
      });
  }
};

const execute = (task: () => void) => {
  curCount = 0;
  map = new Map();
  run(task);
};

export const KillAwait = {
  execute,
  promise,
};

export default KillAwait;
