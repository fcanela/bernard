'use strict';

/**
 * Test dependencies
 */
const { spawn } = require('child_process');
const { join } = require('path');
const { expect } = require('chai');

describe('The library', () => {
  // After this timeout, the application should force the exit
  const DEFAULT_TIMEOUT = 200;
  // Duration of the graceful exit task
  const DEFAULT_TASK_TIME = 50;
  // Acceptable milliseconds difference between the result and the
  // expected one
  const TIME_MARGIN = 20;

  // Child process which simulates the test behaviour
  let subprocess;

  /**
   * Instance and do basic subprocess configuration to
   * avoid repeating it in each test
   */
  const servicePath = join(__dirname, 'fake_service.js');
  beforeEach(() => {
    // Kill it if the test run before failed to exit
    if (subprocess) subprocess.kill('SIGKILL');

    subprocess = spawn('node', [servicePath], {
      // Substitute to see output
      //stdio: [process.stdin, process.stdout, process.stderr, 'ipc']
      stdio: ['ignore', 'ignore', 'ignore', 'ipc']
    });
    send('setup', { timeout: DEFAULT_TIMEOUT });
  });

  /**
   * Commodity function to construct and format IPC messages
   *
   * @param {string} type Operation name
   * @param {*} value Additional operation data
   */
  function send(type, value) {
    subprocess.send({ type, value });
  }

  /**
   * Wait for process start
   *
   * Process do not start inmediatly after spawn, some milliseconds
   * are needed to be able to handle IPC messages
   *
   * @async
   * @returns {Promise} Resolves when startup timeout pass
   */
  async function waitForStartup() {
    const DEFAULT_STARTUP_TIME = 200;
    return new Promise((resolve) => setTimeout(resolve, DEFAULT_STARTUP_TIME));
  }

  /**
   * Examine how the process exits after some behaviour.
   *
   * It returns the exit code, signal and duration from behaviour start
   * to exit in milliseconds.
   *
   * @async
   * @param {Function} behaviour Action to perform
   * @return {Promise<Object>} Contains code, signal and duration properties
   */
  function examineExit(behaviour) {
    return new Promise((resolve) => {
      subprocess.on('exit', exitHandler);
      behaviour();
      const hrstart = process.hrtime();

      function exitHandler(code, signal) {
        const hrend = process.hrtime(hrstart);
        const differenceInMs = hrend[0]*1e3 + hrend[1]/1e6;
        subprocess = undefined;
        resolve({
          code, signal,
          duration: differenceInMs
        });
      }
    });
  }

  /**
   * Commodity function to send kill signal to subprocess.
   *
   * Yes. This is because I have a serious problem with lengthy lines.
   *
   * @param {string} signal
   */
  function kill(signal) {
    subprocess.kill(signal);
  }

  /**
   * Commodity function to check that given duration is between some limits.
   * Throws chai library error if duration is outside expected limits.
   *
   * @param {Number} duration Actual duration
   * @param {Number} expected Expected duration
   * @param {Number} margin Acceptable difference between expected and actual duration
   */
  function expectDurationWithin(duration, expected, margin=TIME_MARGIN) {
    const minTime = expected - margin;
    const maxTime = expected + margin;
    expect(duration).to.be.within(minTime, maxTime);
  }

  ['SIGTERM', 'SIGHUP', 'SIGINT'].forEach((signal) => {
    it(`should close gracefully when receive ${signal} signal`, async () => {
      send('addTask', DEFAULT_TASK_TIME);
      await waitForStartup();
      const result = await examineExit(() => kill(signal));
      expectDurationWithin(result.duration, DEFAULT_TASK_TIME);
      // Not POSIX compliant
      expect(result.code).to.equal(0);
    });
  });

  it('should close gracefully when an unhandled exception occurs', async () => {
    send('addTask', DEFAULT_TASK_TIME);
    await waitForStartup();
    const result = await examineExit(() => send('provokeUnhandledException'));
    expectDurationWithin(result.duration, DEFAULT_TASK_TIME);
    expect(result.code).to.equal(1);
  });

  it('should close gracefully when an unhandled promise error occurs', async () => {
    send('addTask', DEFAULT_TASK_TIME);
    await waitForStartup();
    const result = await examineExit(() => send('provokeUnhandledPromiseError'));
    expectDurationWithin(result.duration, DEFAULT_TASK_TIME);
    expect(result.code).to.equal(1);
  });

  it('should force the exit after timeout', async () => {
    send('addTask', DEFAULT_TIMEOUT*2);
    await waitForStartup();
    const result = await examineExit(() => kill('SIGTERM'));
    expectDurationWithin(result.duration, DEFAULT_TIMEOUT);
    expect(result.code).to.equal(1);
  });


});
