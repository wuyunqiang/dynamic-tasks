/**
 * 让出主线程 
 * 用户可以手动分解长任务
 * @returns Promise
 */
export const yieldToMain = async () => {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
};

/**
 * @returns Promise
 */
export const sleep = async (time:number) => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};