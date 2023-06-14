/* eslint-disable @typescript-eslint/no-empty-function */
import { Resolve, Task, TaskRes } from "../type/task";

/**
 * 并行最大任务
 * @param {Function[]} tasks 接收任务数组
 * @param {number} max 最大并行个数
 * @returns Promise
 */
export const parallelMaxTask = async (tasks = [], max = 3) => {
  let _resolve: Resolve = () => { };
  const resList: TaskRes[] = [];
  const p = new Promise((resolve) => {
    _resolve = resolve;
  });

  if (!tasks.length) {
    _resolve(resList);
    return p;
  }
  max = Math.min(max, tasks.length);
  let curParallelTaskCount = 0;
  let index = 0;
  let doneCount = 0;
  const run = async () => {
    if (curParallelTaskCount >= max || index >= tasks.length) {
      return;
    }
    const curIndex = index++;
    try {
      ++curParallelTaskCount;
      const task: Task = tasks[curIndex];
      const res = await task(resList);
      resList[curIndex] = {
        status: "succ",
        data: res,
      };
    } catch (error) {
      resList[curIndex] = {
        status: "fail",
        data: error,
      };
    } finally {
      doneCount++;
      curParallelTaskCount--;
      if (tasks.length === doneCount) {
        _resolve(resList);
      } else {
        run();
      }
    }
  };
  for (let i = 0; i < max; i++) {
    run();
  }
  return p;
};
