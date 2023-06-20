declare interface DedicatedWorkerGlobalScope {
    addEventListener:(name: string, callback: any, bubble: boolean)=>void;
    postMessage:(data: any)=>void;
    name: string;
    onmessage: null;
    onmessageerror: null
}