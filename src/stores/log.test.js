/*
 * Copyright 2026 KubeClipper Authors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import LogStore from './log';

jest.mock('./base', () => class BaseStore {});
jest.mock('utils/constants', () => ({
  APIVERSION: { operations: 'api/operations.kubeclipper.io/v1alpha1' },
}));

describe('task log fetching', () => {
  afterEach(() => {
    delete global.request;
  });

  it('ends loading and preserves an API reason when the initial request fails', async () => {
    global.request = {
      get: jest.fn().mockRejectedValue({
        reason: 'agent Task log endpoint is unavailable',
      }),
    };
    const store = new LogStore();
    store.isExpand = true;

    await store.fetchStepLog({ taskName: 'task-1' });

    expect(store.error).toBe('agent Task log endpoint is unavailable');
    expect(store.isLoading).toBe(false);
    expect(store.isExpand).toBe(true);
    expect(store.logdata).toBe('');
    expect(store.cumulativeSize).toBe(0);
  });

  it('ends loading after an initial failure and allows the request to be retried', async () => {
    global.request = {
      get: jest
        .fn()
        .mockRejectedValueOnce(new Error('request failed'))
        .mockResolvedValueOnce({
          content: 'recovered',
          deliverySize: 9,
          logSize: 9,
        }),
    };
    const store = new LogStore();
    await store.getStepLog({ taskName: 'task-1' });
    expect(store.error).toBe('request failed');
    expect(store.isLoading).toBe(false);
    await store.getStepLog({ taskName: 'task-1' });
    expect(store.error).toBe('');
    expect(store.logdata).toBe('recovered');
    expect(store.isLoading).toBe(false);
    expect(request.get).toHaveBeenLastCalledWith(expect.any(String), {
      offset: 0,
      limit: 65536,
    });
  });

  it('queues the final fetch behind an in-flight poll and uses the new offset', async () => {
    let finishPoll;
    global.request = {
      get: jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              finishPoll = resolve;
            })
        )
        .mockResolvedValueOnce({
          content: 'ERROR: custom executor failed\n',
          deliverySize: 30,
          logSize: 35,
        }),
    };
    const store = new LogStore();

    const poll = store.fetchStepLog({ taskName: 'task-1', offset: 0 });
    const finalFetch = store.fetchStepLog({ taskName: 'task-1', offset: 0 });

    expect(request.get).toHaveBeenCalledTimes(1);
    finishPoll({ content: 'start', deliverySize: 5, logSize: 5 });
    await Promise.all([poll, finalFetch]);

    expect(request.get).toHaveBeenLastCalledWith(
      'api/operations.kubeclipper.io/v1alpha1/operationtasks/task-1/logs',
      { offset: 5, limit: 65536 }
    );
    expect(store.logdata).toBe('startERROR: custom executor failed\n');
    expect(store.cumulativeSize).toBe(35);
  });

  it('drains every remaining chunk when the task has finished', async () => {
    global.request = {
      get: jest
        .fn()
        .mockResolvedValueOnce({
          content: 'start',
          deliverySize: 5,
          logSize: 10,
        })
        .mockResolvedValueOnce({
          content: 'error',
          deliverySize: 5,
          logSize: 10,
        }),
    };
    const store = new LogStore();
    store.isStepFinished = true;

    await store.fetchStepLog({ taskName: 'task-1' });

    expect(store.logdata).toBe('starterror');
    expect(store.cumulativeSize).toBe(10);
    expect(store.fetchPromise).toBeNull();
  });
  it('keeps the offset on failure and retries the terminal tail', async () => {
    global.request = {
      get: jest
        .fn()
        .mockResolvedValueOnce({
          content: 'start',
          deliverySize: 5,
          logSize: 10,
        })
        .mockRejectedValueOnce(new Error('agent unreachable'))
        .mockResolvedValueOnce({
          content: 'error',
          deliverySize: 5,
          logSize: 10,
        }),
    };
    const store = new LogStore();
    store.isStepFinished = true;
    await store.getStepLog({ taskName: 'task-1' });
    expect(store.error).toBe('agent unreachable');
    expect(store.isLoading).toBe(false);
    expect(store.cumulativeSize).toBe(5);
    expect(store.logdata).toBe('start');
    await store.getStepLog({ taskName: 'task-1' });
    expect(request.get).toHaveBeenLastCalledWith(expect.any(String), {
      offset: 5,
      limit: 65536,
    });
    expect(store.logdata).toBe('starterror');
    expect(store.error).toBe('');
  });

  it('runs the queued final fetch even when its preceding poll fails', async () => {
    let rejectPoll;
    global.request = {
      get: jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve, reject) => {
              rejectPoll = reject;
            })
        )
        .mockResolvedValueOnce({
          content: 'final',
          deliverySize: 5,
          logSize: 5,
        }),
    };
    const store = new LogStore();
    const poll = store.fetchStepLog({ taskName: 'task-1' });
    store.isStepFinished = true;
    const final = store.fetchStepLog({ taskName: 'task-1' });
    rejectPoll(new Error('poll failed'));
    await Promise.all([poll, final]);
    expect(store.logdata).toBe('final');
    expect(store.error).toBe('');
    expect(store.isLoading).toBe(false);
  });

  it('discards a late response after collapse and restarts at zero on reopen', async () => {
    let finish;
    global.request = {
      get: jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              finish = resolve;
            })
        )
        .mockResolvedValueOnce({ content: 'new', deliverySize: 3, logSize: 3 }),
    };
    const store = new LogStore();
    const old = store.fetchStepLog({ taskName: 'task-1' });
    store.logReset();
    finish({ content: 'stale', deliverySize: 5, logSize: 5 });
    await old;
    expect(store.logdata).toBe('');
    expect(store.cumulativeSize).toBe(0);
    expect(store.isExpand).toBe(false);
    await store.getStepLog({ taskName: 'task-1' });
    expect(request.get).toHaveBeenLastCalledWith(expect.any(String), {
      offset: 0,
      limit: 65536,
    });
    expect(store.logdata).toBe('new');
    expect(store.isExpand).toBe(false);
  });

  it('uses delivered bytes instead of JavaScript string length', async () => {
    global.request = {
      get: jest
        .fn()
        .mockResolvedValueOnce({
          content: '中文',
          deliverySize: 6,
          logSize: 10,
        })
        .mockResolvedValueOnce({
          content: 'tail',
          deliverySize: 4,
          logSize: 10,
        }),
    };
    const store = new LogStore();
    store.isStepFinished = true;
    await store.getStepLog({ taskName: 'task-1' });
    expect(request.get).toHaveBeenLastCalledWith(expect.any(String), {
      offset: 6,
      limit: 65536,
    });
    expect(store.logdata).toBe('中文tail');
  });

  it.each(['resolve', 'reject'])(
    'reopens while the old request is pending and ignores its late %s',
    async (outcome) => {
      let finishOld;
      let rejectOld;
      let finishNew;
      global.request = {
        get: jest
          .fn()
          .mockImplementationOnce(
            () =>
              new Promise((resolve, reject) => {
                finishOld = resolve;
                rejectOld = reject;
              })
          )
          .mockImplementationOnce(
            () =>
              new Promise((resolve) => {
                finishNew = resolve;
              })
          ),
      };
      const store = new LogStore();
      const oldRead = store.fetchStepLog({ taskName: 'task-1' });
      const oldQueuedRead = store.fetchStepLog({ taskName: 'task-1' });
      store.logReset();

      const reopened = store.getStepLog({ taskName: 'task-1' });
      const pending = store.fetchPromise;
      expect(request.get).toHaveBeenCalledTimes(2);
      expect(request.get).toHaveBeenLastCalledWith(expect.any(String), {
        offset: 0,
        limit: 65536,
      });

      if (outcome === 'resolve') {
        finishOld({ content: 'stale', deliverySize: 5, logSize: 5 });
      } else {
        rejectOld(new Error('stale request failed'));
      }
      await Promise.all([oldRead, oldQueuedRead]);
      expect(store.fetchPromise).toBe(pending);
      expect(store.isLoading).toBe(true);
      expect(store.logdata).toBe('');
      expect(store.error).toBe('');

      finishNew({ content: 'fresh', deliverySize: 5, logSize: 5 });
      await reopened;
      expect(request.get).toHaveBeenCalledTimes(2);
      expect(store.logdata).toBe('fresh');
      expect(store.cumulativeSize).toBe(5);
      expect(store.isLoading).toBe(false);
      expect(store.fetchPromise).toBeNull();
    }
  );
});
