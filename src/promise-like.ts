export const isPromiseLike = (promise: any) => {
    return (
       promise !== null &&
      (typeof promise === "object" || typeof promise === "function") &&
      typeof promise.then === "function"
    );
  }