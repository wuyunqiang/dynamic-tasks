/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * 支持动态添加
 * 支持并行&串行
 * 支持同步&异步
 * 支持时间切片
 */
import { nextFrameExecute } from './next-frame-execute'
import { Config, TaskItem, TaskList } from '../type/task'
export const TaskStatus = {
    Done: 1,
    Processing: 2,
};

export class DynamicTasks {
    status = TaskStatus.Done;
    store: any = {}; // 存储结果
    handles: TaskList = []; // 回调列表
    parallelMax;
    frame = false;
    curParallelTaskCounter = 0;
    _resolve = (value: any) => { };
    p = new Promise((resolve) => {
        this._resolve = resolve;
    });
    constructor(params?: Config) {
        const config = params || {};
        this.parallelMax = config.parallelMax || 3;
        this.frame = !!config.frame;
    }
    getResult() {
        return this.store;
    }
    removeItem(key: string) {
        if (this.store[key]) {
            Reflect.deleteProperty(this.store, key);
        }
    }
    removeStore() {
        this.store = {};
    }
    async start(data: TaskItem | TaskList) {
        const list = Array.isArray(data) ? data : [data];
        this.handles.push(...list);
        return this.run();
    }
    async loopRun() {
        if (!this.handles.length) {
            this.status = TaskStatus.Done;
            this._resolve(this.store);
            return;
        }
        const nextTask = this.handles[0];
        // 串行阶段有尚未结束的任务 等待之前的任务结束后在继续执行
        if (!nextTask.parallel && this.curParallelTaskCounter >= 1) {
            return;
        }
        if (nextTask.parallel && this.curParallelTaskCounter >= this.parallelMax) {
            return;
        }
        const { task, key, parallel = false } = this.handles.shift() as TaskItem;
        const runner = this.frame
            ? () => nextFrameExecute(() => task(this.store))
            : () => task(this.store);
        this.curParallelTaskCounter++;
        Promise.resolve(runner()).then((res) => {
            this.store[key] = {
                status: "succ",
                data: res,
            };
        }).catch((error) => {
            this.store[key] = {
                status: "fail",
                data: error,
            };
        })
            .finally(() => {
                this.curParallelTaskCounter--;
                this.loopRun();
            });
        if (parallel) {
            console.log('test 继续并行')
            this.loopRun();
        }
    }
    async run() {
        console.log('test this status', this.status)
        if (this.status === TaskStatus.Processing) {
            return this.p;
        }
        this.p = new Promise((resolve) => {
            this._resolve = resolve;
        })

        if (!this.handles.length) {
            this.status = TaskStatus.Done;
            this._resolve(this.store);
            return this.p;
        }

        this.status = TaskStatus.Processing;
        this.loopRun();
        return this.p;
    }
}