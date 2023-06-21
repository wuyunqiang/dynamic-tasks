export const workerStr = `
this.store = {};
this.addEventListener(
  "message",
  function (e) {
    var key = e.data.key;
    if(e.data.type === 'remove-item' && this.store[key]){
      this.store[key] = null;
      return;
    }
    if(e.data.type === 'remove'){
      this.store = {};
      return;
    }
    if (!e.data.task) {
      return;
    }
    var task = new Function('return (' + e.data.task + ')(this.store)');
    Promise.resolve(task())
      .then((res) => {
        this.store[key] = {
          status: "succ",
          data: res,
        };
      })
      .catch((error) => {
        this.store[key] = {
          status: "fail",
          data: error,
        };
      })
      .finally(() => {
        console.log('test worker res', {
          key,
          ...this.store[key],
        })
        this.postMessage({
          key,
          ...this.store[key],
        });
      });
  },
  false
);

`;

export default workerStr;
