/**
 *
 * @param task  返回一个promise的异步任务
 * @param count 需要重试的次数
 * @param time  每次重试间隔多久
 * @returns 返回一个新promise
 */
export const retry = (task: ()=>Promise<any>, count = 5, time = 3 * 1000) => {
    return new Promise((_res, _rej) => {
        let doneCount = 0;
        const run = () => {
            task()
                .then(data => {
                    _res(data);
                })
                .catch(err => {
                    doneCount++;
                    if (doneCount > count) {
                        _rej(err);
                    } else {
                        setTimeout(run, time);
                    }
                });
        };
        run();
    });
};