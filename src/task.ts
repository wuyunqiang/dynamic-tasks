/***
 *
 * ! all
 * queueMicrotask https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask
 * promise
 *
 * ! node:
 * process.nextTick
 * setImmediate
 *
 * ! browser:
 * MutationObserver https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 * MessageChannel
 *
 * ! all
 * setTimeout
 */

import { Task } from "../type/task";

const micros = [
    {
        name: 'queueMicrotask',
        test: () => {
            return typeof queueMicrotask === "function";
        },
        run: (callback: Task) => {
            queueMicrotask(callback);
        },
    },
    {
        name: 'Promise',
        test: () => {
            return typeof Promise !== "undefined";
        },
        run: (callback: Task) => {
            Promise.resolve().then(callback);
        },
    },
    {
        name: 'process.nextTick',
        test: () => {
            return (
                typeof process === "object" && typeof process.nextTick === "function"
            );
        },
        run: (callback: Task) => {
            process.nextTick(callback);
        },
    },
    {
        name: 'MutationObserver',
        test: () => {
            return (
                typeof MutationObserver !== "undefined" && typeof window !== "undefined"
            );
        },
        run: (callback: Task) => {
            const observer = new MutationObserver(callback);
            const element = document.createTextNode("");
            observer.observe(element, {
                characterData: true,
            });
            const change = () => {
                element.data = `${Date.now()}`;
            };
            change();
        },
    },
];

const macros = [{
    name: 'MessageChannel',
    test: () => {
        return (
            typeof MessageChannel !== "undefined" && typeof window !== "undefined"
        );
    },
    run: (callback: Task) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = callback;
        const change = function () {
            channel.port2.postMessage(0);
        };
        change();
    },
},
{
    name: 'setImmediate',
    test: () => {
        return typeof setImmediate === "function";
    },
    run: (callback: Task) => {
        setImmediate(callback);
    },
},
{
    name: 'raf',
    test: () => {
        return (
            typeof requestAnimationFrame !== "undefined" && typeof window !== "undefined"
        );
    },
    run: (callback: Task) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(callback)
        })
    }
},
{
    name: 'setTimeout',
    test: () => {
        return true;
    },
    run: (callback: Task) => {
        setTimeout(callback, 0);
    },
}]

export const microTask = (callback: Task) => {
    const runner = [...micros, ...macros].find((item) => item.test());
    runner && runner.run(callback);
};

export const macroTask = (callback: Task) => {
    const runner = macros.find((item) => item.test());
    runner && runner.run(callback);
};
