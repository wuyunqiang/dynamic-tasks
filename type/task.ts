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

export type TaskList = TaskItem[]
export type Resolve = (value: any) => void

export type TaskRes = {
    status: "succ" | 'fail',
    data: any,
}

export interface PromiseCancel extends Promise<any>{
    cancel:()=>void;
    isCancel: ()=> boolean
}