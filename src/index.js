'use strict';

/**
 * Module dependencies
 */
const chorizo = require('chorizo');
const logger = chorizo.for('graceful-exit');

module.exports = class GracefulExitManager {
  /**
   * Create a graceful exit manager
   *
   * @param {object} options Contains the manager options
   * @param {number} options.timeout Time to wait (in secons) before forcing
   * the exit
   */
  constructor(options={}) {
    this._timeout = options.timeout || 20;

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
      logger.info(`Running closing task "${task.title}"`);
      await task.handler();
    }
  }

  /**
   * Some task could fail or take too long.
   */
  _startTimeoutCountdown() {
    const timeoutInMs = this._timeout * 1000;

    setTimeout(() => {
      // NOTE: This is not POSIX compliant. If a signal caused the
      // close process, it should return 128 + signal number
      logger.warn('Unable to exit gracefully. Forcing the exit');
      process.exitCode = 1;
      process.exit();
    }, timeoutInMs);
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

    const message = `Finishing application execution. Waiting ${this._timeout} seconds for graceful exit`;
    logger.warn(message);

    this._startTimeoutCountdown();
    await this._runTasks();

    // Close tasks finished. Application still running because the timeout check
    // is in the event loop
    process.exitCode = 0;
    process.exit();
  }

  /**
   * Attach graceful exit handler to exit events
   */
  configure() {
    // Configure logger.fatal option to invoke graceful exit
    require('chorizo').once('fatal', () => {
      logger.info('Proceding to graceful exit after fatal error');
      this._shutdown();
    });

    // Configure process signals to invoke graceful exit
    ['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((signal) => {
      process.on(signal, this._shutdown.bind(this));
    });

    // React to unhandled errors with graceful exit
    process.on('unhandledRejection', function(reason){
      logger.fatal('Unhandled Promise Rejection. Reason: ' + reason);
      logger.info('Proceding to graceful exit after an unhandled promise');
      process.kill(process.pid, 'SIGTERM');
    });
    process.on('uncaughtException', function(err) {
      logger.fatal('Uncaught Exception', err);
      logger.info('Proceding to graceful exit after an uncaught exception');
      process.kill(process.pid, 'SIGTERM');
    });
  }
};

