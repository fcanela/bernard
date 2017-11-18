'use strict';

class FakeService {
  constructor() {
    this._running = true;
  }

  start() {
    this._interval = setInterval(() => {
      if (!this._running) {
        clearInterval(this._interval);
        console.log('Service stopped');
      }
      console.log('Working. Press Control+C or send a signal to test');
    }, 1000);
  }

  stop() {
    this._running = false;
  }
}


function createDelayTask(title, durationInSecs=2) {
  return {
    title,
    handler: function close() {
      return new Promise((resolve) => {
        setTimeout(resolve, durationInSecs * 1000);
      });
    }
  };
}


const GracefulExit = require('./rescue-parachute');
const manager = new GracefulExit();

manager.configure();


const service = new FakeService();

manager.addTask(createDelayTask('pre-task', 2));
const closeServiceTask = {
  title: 'Service',
  handler: function closeService() {
    service.stop();
  }
};
manager.addTask(closeServiceTask);
manager.addTask(createDelayTask('post-task', 2));

service.start();



