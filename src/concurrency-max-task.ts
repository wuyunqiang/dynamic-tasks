/* eslint-disable @typescript-eslint/no-empty-function */
import { Resolve, Task, TaskRes } from "../type/task";

/**
 * 并行最大任务
 * @param {Function[]} tasks 接收任务数组
 * @param {number} max 最大并行个数
 * @returns Promise
 */
export const concurrencyMaxTask = async (tasks: Task[] = [], max = 3) => {
  let _res: Resolve;
  const p = new Promise((res) => {
    _res = res;
  });

  const resList: TaskRes[] = []; // 结果数组
  let doneCount = 0; // 当前完成任务的总数量
  let index = 0; // 下一个将要被执行的任务索引
  const run = async (curIndex: number) => {
    if (curIndex >= tasks.length) {
      return;
    }
    tasks[curIndex]()
      .then((data: any) => {
        resList[curIndex] = {
          status: "succ",
          data,
        };
      })
      .catch((err: any) => {
        resList[curIndex] = {
          status: "fail",
          data: err,
        };
      })
      .finally(() => {
        doneCount++;
        if (doneCount >= tasks.length) {
          _res(resList);
        } else {
          run(index++);
        }
      });
  };

  max = Math.min(max, tasks.length);
  // 同步执行最大并行数
  for (let i = 0; i < max; i++) {
    run(index++);
  }

  return p;
};