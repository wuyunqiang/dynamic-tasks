/**
 * 当前任务没有完成时 多次调用会共享同一个promise实例状态
 * @param task 需要运行的异步任务
 * @returns 
 */
export const sharePromise = (task: () => Promise<any>) => {
    let _shareP: Promise<any> | null = null;
    return () => {
        if (!_shareP) {
            _shareP = new Promise((_res, _rej) => {
                task().then((res) => {
                    _res(res)
                }).catch((err) => {
                    _rej(err)
                }).finally(() => {
                    _shareP = null;
                })
            });
        }
        return _shareP;
    };
};