'use strict';

/**
 * Module dependencies
 */
const EventEmitter = require('events').EventEmitter;
const Bernard = require('../src');

/**
 * Listening service simulation
 */
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

/**
 * Initial configuration
 */

// Without this in the event loop, the process would close before we can
// configure it
const keepAliveInterval = setInterval(() => {}, 3600*1000);

/**
 * IPC Controller
 *
 * Using IPC as communication channel between this process and the tests.
 *
 * This communication is needed to tune the process behaviour for the specific
 * tests. For example, configuring it to exit gracefully or forced by timeout.
 */
const ipcController = new EventEmitter();

let bernard;
ipcController.on('setup', function(config) {
  bernard = new Bernard(config);

  // Notify tests about all events
  const events = [
    'taskStart', 'timeout', 'shutdown', 'signal', 'unhandledRejection',
    'uncaughtException'
  ];
  events.forEach(function(event) {
    bernard.on(event, function(value) {
      process.send({ event, value });
    });
  });

  bernard.prepare();
});

ipcController.on('addTask', function(timeout) {
  clearInterval(keepAliveInterval);

  const service = new FakeService(timeout);
  service.start();

  const task = {
    title: 'whatever',
    handler: service.close.bind(service)
  };
  bernard.addTask(task);
});

ipcController.on('provokeUncaughtException', function() {
  throw new Error('Unhandled exception example');
});

ipcController.on('provokeUnhandledRejection', function() {
  new Promise(() => {
    throw new Error('Unhandled rejection error example');
  });
});

// Start listening for test orders
process.on('message', function(msg) {
  ipcController.emit(msg.type, msg.value);
});

