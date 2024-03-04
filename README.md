# 一个避免卡顿的js任务库

# 核心思路：<br>
基于[rail](https://web.dev/rail/)标准,通过webworker并行,长任务拆分&分帧执行,让出主线程,利用浏览器空闲执行等方式<br>
避免js线程长期执行,阻塞UI渲染。以达到性能优化的目的。

<img width="1440" alt="截屏2024-03-03 下午5 29 57" src="https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/9b6be4c8-a6a0-4614-855e-cd8bdc382f7b">


![new-thread](https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/aad5de7f-6919-401f-b165-cf36f0e46638)

## normal
https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/e3dd2bdc-ba3a-469d-b8eb-7fa2a68819d2

<img width="1327" alt="normal" src="https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/8ed704ec-1428-4b53-9ea7-4f5f96dbe19e">


## frame
https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/d2d89081-5d89-4df9-8c3a-c22b7ca36956

<img width="1307" alt="frame" src="https://github.com/wuyunqiang/dynamic-tasks/assets/13480948/b1c7cc68-73bb-4347-acc7-63fcaef7e586">

```
npm install dynamic-tasks || yarn add dynamic-tasks
```

```
默认ES6语法 使用方自行转译和polyfill
例如vue: 通过配置vue.config.js里面的transpileDependencies

例如react通过配置
rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(dynamic-tasks)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
```

```javascript
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

## yieldToMain
让出主线程 避免长任务阻塞UI 造成页面卡顿<br>
此方法后面的任务将在下一帧继续执行。<br>
优先使用MessageChannel宏任务&无延迟 使用setTimeOut兼容处理
```javascript
import {yieldToMain} from "dynamic-tasks";
p1()
await yieldToMain(); // 中断当前帧 让出给main thread 下一帧继续执行
p2();
```

## sleep
```javascript
import { sleep } from "dynamic-tasks";
console.log('111111')
await sleep(2000) // 两秒后继续执行
console.log('222222')
```

## nextFrameExecute
下一帧执行某个任务 <br>
实现优先级：<br>
1:使用MessageChannel宏任务方式<br>
2:使用requestAnimationFrame <br>
3:使用setTimeout做兼容。<br>
```javascript
import { nextFrameExecute } from "dynamic-tasks";
p1()
nextFrameExecute(p2) // 将在下一帧执行这个任务
p3()
```

## DynamicTasks 
有UI操作并且优先级较高 建议使用DynamicTasks的方式 避免卡顿使用frame参数分帧运行<br>
 * 支持动态添加
 * 支持并行&串行
 * 支持同步&异步
 * 支持时间切片


```javascript
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

```javascript
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
```javascript
import { clearPool } from "dynamic-tasks"
clearPool()
```

## idleCallback
浏览器空闲执行 不紧急的任务建议使用这个api<br>
不建议UI操作：<br>
原因1：此时已经渲染完成，UI变更会导致页面重绘应尽量避免<br>
原因2：因为调用时机不确定 dom操作会导致页面视觉变动难以预测<br>
参考react fiber思路通过raf+messagechannel 对不支持requestidlecallback的浏览器做了polyfill。
```javascript
import { idleCallback } from "dynamic-tasks"
idleCallback((params)=>{
  console.log('test idleCallback params', params)
  }, { timeout: 100})
```

## idle 
浏览器空闲执行 不紧急的任务建议使用这个api <br>
不建议UI操作：<br>
原因1：此时已经渲染完成，UI变更会导致页面重绘应尽量避免<br>
原因2：因为调用时机不确定 dom操作会导致页面视觉变动难以预测<br>
内部使用idleCallback方法。
```javascript
import { idle } from "dynamic-tasks"
 idle([{key: 'p1',task: p1}],100).then(res => {
  console.log('test idle:', res)
})
```

## serialTask
顺序执行一系列任务 并返回结果

```javascript
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
并发执行一系列任务并返回结果

```javascript
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
封装的一个可以取消的promise任务

```javascript
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


## [KillAwait](https://github.com/wuyunqiang/blog/issues/23) 
Promise的同步调用 消除异步的传染性
```
import { KillAwait } from "dynamic-tasks"
const test3 = () => {
  const res = KillAwait.promise((resolve) => {
    setTimeout(() => {
      resolve(3);
    }, 2000);
  });
  console.log("test 3 res", res);
  return res;
};

const test2 = () => {
  const res = KillAwait.promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, 2000);
  });

  console.log("test 2 res", res);
  return test3();
};

const test1 = () => {
  const res1 = KillAwait.promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 2000);
  });

  console.log("test 1 res1", res1);
  const res2 = KillAwait.promise((resolve) => {
    setTimeout(() => {
      resolve(1.2);
    }, 2000);
  });

  console.log("test 1 res2", res2);
  return test2();
};

const main2 = () => {
  const res = test1();
  console.log("test 最终结果 res", res);
};
KillAwait.execute(main2);
// res
test 1 res1 1
test 1 res1 1
test 1 res2 1.2
test 1 res1 1
test 1 res2 1.2
test 2 res 2
test 1 res1 1
test 1 res2 1.2
test 2 res 2
test 3 res 3
test 最终结果 res 3
```

## microTask&macroTask
微任务
```
import { microTask, macroTask } from "dynamic-tasks"
microTask(()=>{
  console.log('microTask')
})

macroTask(()=>{
  console.log('macroTask')
})
```




