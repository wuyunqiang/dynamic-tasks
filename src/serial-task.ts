/* eslint-disable @typescript-eslint/no-empty-function */
import { Resolve, Task, TaskRes } from "../type/task";

/**
 * 串行任务 顺序执行 并返回结果
 * @param {Function[]} tasks 接受一个函数的数组 数组中的每个函数将接收前面的结果
 * @returns Promise
 */
export const serialTask = async (tasks = []) => {
    const resList:TaskRes[] = [];
    let _resolve: Resolve = ()=>{};
  
    const p = new Promise((resolve) => {
      _resolve = resolve;
    });
    if (!tasks.length) {
      _resolve(resList);
      return;
    }
    let curIndex = 0;
    const run = () => {
      if (curIndex < tasks.length) {
        const task:Task = tasks[curIndex];
        Promise.resolve(task(resList))
          .then((res:any) => {
            resList[curIndex] = {
              status: "succ",
              data: res,
            };
          })
          .catch((err:any) => {
            resList[curIndex] = {
              status: "fail",
              data: err,
            };
          })
          .finally(() => {
            if (++curIndex === tasks.length) {
              _resolve(resList);
            } else {
              run();
            }
          });
      }
    };
    run();
    return p;
  };