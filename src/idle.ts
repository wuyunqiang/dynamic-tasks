/* eslint-disable @typescript-eslint/no-empty-function */

import { Resolve, Store, PoolList } from "../type/task";
import { IdleCallBackFnParams, idleCallback } from "./idle-callback";

export const idle = async (tasks: PoolList, timeout = -1, max = 1) => {
  let _resolve: Resolve = () => { };
  const store: Store = {};
  const p = new Promise((resolve) => {
    _resolve = resolve;
  });

  if (!tasks.length) {
    _resolve(store);
    return p;
  }
  max = Math.min(max, tasks.length);
  let curParallelTaskCount = 0;
  let index = 0;
  let doneCount = 0;
  const run = async () => {
    const curIndex = index++;
    if (curParallelTaskCount >= max || curIndex >= tasks.length) {
      return;
    }
    idleCallback((idleParams: IdleCallBackFnParams) => {
      console.log('test idleParams: ', idleParams, idleParams.timeRemaining())
      const { task, key } = tasks[curIndex];
      ++curParallelTaskCount;
      Promise.resolve(task(store)).then(res => {
        store[key] = {
          status: "succ",
          data: res,
        };
      }).catch((error) => {
        store[key] = {
          status: "fail",
          data: error,
        };
      }).finally(() => {
        doneCount++;
        curParallelTaskCount--;
        if (tasks.length === doneCount) {
          _resolve(store);
        } else {
          run();
        }
      });
    }, {
      timeout
    })
  };
  for (let i = 0; i < max; i++) {
    run();
  }
  return p;
};
