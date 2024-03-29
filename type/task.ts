export type Config = {
    parallelMax?: number;
    frame?: boolean;
}

export type Task = (res?: any)=> any

export type TaskItem = {
    key: string;
    task: Task,
    parallel?: boolean;
}


export type PoolItem = {
    key: string;
    task: Task,
}

export type PoolList = PoolItem[]

export type TaskList = TaskItem[]
export type Resolve = (value?: any) => void

export type TaskRes = {
    status: "succ" | 'fail',
    data: any,
}

export interface PromiseCancel extends Promise<any>{
    cancel:()=> Promise<any>;
    isCancel: ()=> boolean
}

export type Store = { [key: string]: TaskRes }