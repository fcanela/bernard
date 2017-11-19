'use strict';

class FakeService {
  /**
   * @param {Number} timeout Close request delay
   */
  constructor(timeout) {
    this._timeout = timeout;
  }

  /**
   * Simulate a permanent listening
   */
  start() {
    this._listener = setInterval(() => {}, 3600*1000);
  }

  /**
   * Simulate the wait of closing a listener pending tasks
   *
   * @return {Promise} Resolves after timeout pass
   */
  close() {
    return new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(this._listener);
        resolve();
      }, this._timeout);
    });
  }
}


const Bernard = require('../src');
const bernard = new Bernard();

bernard.prepare();

// Initialize a service with 8 seconds close delay
const service = new FakeService(8*1000);
service.start();

const closeServiceTask = {
  title: 'close service',
  handler: service.close.bind(service)
};
bernard.addTask(closeServiceTask);

console.log(`Process running with PID ${process.pid}`);
console.log('Press Control+C or send a signal to test the closing behaviour');
