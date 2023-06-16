# dynamic-tasks
## 基于promise的动态任务库

功能：<br>
1: 支持动态添加任务<br>
2: 支持并行&串行<br>
3: 支持同步&异步<br>
4: 支持时间切片<br>

https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/e3dd2bdc-ba3a-469d-b8eb-7fa2a68819d2

https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/d2d89081-5d89-4df9-8c3a-c22b7ca36956




```
npm install dynamic-tasks || yarn add dynamic-tasks
```

```
import {
  DynamicTasks,
  serialTask,
  parallelMaxTask,
  TaskCancelable,
  nextFrameExecute,
} from "dynamic-tasks";
const p1 = (res) => {
  console.log("test p1 res", res, 1111);
  return 1111;
};

const p2 = (res) => {
    console.log("test p2 res", res, 1111);
  return 2222;
};

const p3 = (res) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(33333);
      console.log("test p2 res", res, 33333);
    }, 2000);
  });
const p4 = (res) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(4444);
      console.log("test p4 res", res, 4444);
    }, 6000);
  });
const p5 = (res) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(5555);
      console.log("test p5 res", res, 5555);
    }, 1000);
  });

const task = new DynamicTasks({ parallelMax: 3, frame: true });
task.start([
  {
    key: "p1",
    task: p1,
    parallel: true,
  },
  {
    key: "p2",
    task: p2,
    parallel: true,
  },
]);

task.start([
  {
    key: "p3",
    task: p3,
    parallel: true,
  },
  {
    key: "p4",
    task: p4,
    parallel: true,
  },
  {
    key: "p5",
    task: p5, // 默认的串行的 会等待前面的全部执行完成 并且可以获取前面的结果
  },
  {
    key: "p6",
    task: (allResult)=>{
        console.log('test allResult', allResult)
    },
  },
]);
```
















