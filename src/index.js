'use strict';

/**
 * Module dependencies
 */
const EventEmitter = require('events').EventEmitter;

module.exports = class Bernard extends EventEmitter {
  /**
   * Create a instance of bernard
   *
   * @param {object} options Contains the manager options
   * @param {number} options.timeout Time to wait (in milliseconds) before forcing
   * the exit
   */
  constructor(options={}) {
    // Call  EventEmitter constructor
    super();

    this._timeout = options.timeout || 20*1000;

    this._isExiting = false;
    this._tasks = [];
  }

  /**
   * Add a task to be run on process exit.
   *
   * Tasks objects should have a title string and handler
   * function properties. They will be called in FIFO order.
   *
   * @param {object} task Task definition
   * @param {title} task.title Describes the task
   * @param {function} task.handler Implements the task logic
   */
  addTask(task) {
    if (!task.title) throw new Error('Exit task have no title property');
    if (!task.handler) throw new Error('Exit task ' + task.title + ' have no handler property');
    if (!(task.handler instanceof Function)) throw new Error('Exit task ' + task.title + ' handler is not a function');

    this._tasks.push(task);
  }

  /**
   * Run all exiting tasks one by one in FIFO order.
   *
   * @async
   */
  async _runTasks() {
    for (let task of this._tasks) {
      this.emit('taskStart', task.title);
      await task.handler();
    }
  }

  /**
   * Some task could fail or take too long.
   */
  _startTimeoutCountdown() {
    setTimeout(() => {
      this.emit('timeout');

      // NOTE: This is not POSIX compliant. If a signal caused the
      // close process, it should return 128 + signal number
      process.exitCode = 1;
      process.exit();
    }, this._timeout);
  }

  /**
   * Starts the exit process
   *
   * @async
   */
  async _shutdown() {
    // Avoid multiple exit tasks
    if (this._isExiting) return;
    this._isExiting = true;

    this.emit('shutdown', { timeout: this._timeout });

    this._startTimeoutCountdown();
    await this._runTasks();

    // Close tasks finished. Application still running because the timeout check
    // is in the event loop
    process.exit();
  }

  /**
   * Attach graceful exit handler to exit events
   */
  prepare() {
    // Configure process signals to invoke graceful exit
    ['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((signal) => {
      process.on(signal, () =>  {
        this.emit('signal', signal);
        this._shutdown();
      });
    });

    // React to unhandled errors with graceful exit
    ['unhandledRejection', 'uncaughtException'].forEach((errorCause) => {
      process.on(errorCause, (error) => {
        this.emit(errorCause, error);
        process.exitCode = 1;
        process.kill(process.pid, 'SIGTERM');
      });
    });
  }
};
