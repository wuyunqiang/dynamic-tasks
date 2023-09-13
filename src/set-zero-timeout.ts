/**
 * MessageChannel宏任务于setTimeout类似 立即执行无延迟
 * @param fn 
 */
export const setZeroTimeout = (fn: () => void) => {
    const channel = new MessageChannel(); // 建立宏任务的消息通道
    const port1 = channel.port1;
    const port2 = channel.port2;
    port2.onmessage = () => {
        fn();
    }
    port1.postMessage('zero')
}
