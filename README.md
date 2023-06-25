# 基于 promise 的动态任务库

https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/e3dd2bdc-ba3a-469d-b8eb-7fa2a68819d2

https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/d2d89081-5d89-4df9-8c3a-c22b7ca36956

```
npm install dynamic-tasks || yarn add dynamic-tasks
```

```
const p1 = (res) => {
  return 1111;
};

const p2 = (res) => {
  return 2222;
};

const p3 = (res) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(33333);
    }, 2000);
  });
const p4 = (res) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(4444);
    }, 6000);
  });
const p5 = (res) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(5555);
    }, 1000);
  });
```
# 功能：<br>
## DynamicTasks 支持动态添加任务 支持时间切片<br>
有UI操作并且优先级较高 建议使用DynamicTasks的方式 避免卡顿使用frame参数分帧运行<br>

```
import {DynamicTasks} from "dynamic-tasks";
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


## pool 支持web worker线程池<br>
无UI操作 大量运算 建议使用pool的线程池方式运行。<br>
run in web worker thread pool。<br>
独立main thread上下文 使用new Function转换运行，因此不能访问外部变量。<br>
可以通过串行的方式(默认就是串行),获取到上一个task的结果。<br>
可以通过网络获取数据运算。<br>
```
import { pool } from "dynamic-tasks"
const p1 = (res) => {
  console.log("test p1 res", res, 1111);
  return 1111;
};
const p2 = (res) => {
  console.log("test p2 res", 22222);
};
const p3 = (res) =>
  new Promise((resolve) => {
    const test = () => {
      let count = 0;
      for (let i = 0; i < 1000000000; i++) {
        count = count + i;
      }
    };
    test();
    setTimeout(() => {
      resolve(33333);
    }, 5000);
    console.log("test p3 res", res, 3333333);
  });

pool([
  {
    key: "p1",
    task: p1,
  },
  {
    key: "p2",
    task: p2,
  },
  {
    key: "p3",
    task: p3,
  },
], 2).then((res) =>{
  console.log("test pool:", res);
  {
    p1: {
      data: 1111,
      key: "p1",
      status: "succ",
    },
    p2: {
      data: undefined,
      key: "p2",
      status: "succ",
    },
    p3: {
      data: 33333,
      key: "p3",
      status: "succ",
    }
  }
});
```

## clearPool
```
import { clearPool } from "dynamic-tasks"
clearPool()
```

## idleCallback
 浏览器空闲执行 不紧急的任务建议使用这个api
```
import { idleCallback } from "dynamic-tasks"
idleCallback((params)=>{
  console.log('test idleCallback params', params)
  }, { timeout: 100})
```

## idle 
浏览器空闲执行 不紧急的任务建议使用这个api
```
import { idle } from "dynamic-tasks"
 idle([{key: 'p1',task: p1}],100).then(res => {
  console.log('test idle:', res)
})
```

## serialTask

```
import {serialTask} from "dynamic-tasks";
serialTask([p1,p2,p3]).then(res=>{
    console.log("test res", res)
  })
  res:
  [
  { status: 'succ', data: 1111 },
  { status: 'succ', data: 2222 },
  { status: 'succ', data: 33333 }
]
```

## parallelMaxTask

```
import {parallelMaxTask} from "dynamic-tasks";
  parallelMaxTask([p1,p2, p3], 2).then((res)=>{
    console.log('test parallelMaxTask: ', res)
    })
  res:
  [
  { status: 'succ', data: 1111 },
  { status: 'succ', data: 2222 },
  { status: 'succ', data: 33333 }
]
```

## TaskCancelable

```
import {TaskCancelable} from "dynamic-tasks
const p3 = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(33333);
    }, 2000);
  });
const cancelP = TaskCancelable(p3());
cancelP
  .then((res) => {
    console.log("test res", res);
  })
  .catch(() => {
    if (cancelP.isCancel()) { // true
      console.log("test cancel");
    }
  })
  .finally(() => {
    console.log("test finally isCancel:", cancelP.isCancel()); // true
  });
cancelP.cancel();
```

## nextFrameExecute

```
import {nextFrameExecute} from "dynamic-tasks";
nextFrameExecute(p1).then(res=>console.log('test res', res)) // res 1111
```


