/*
 * Copyright 2021 KubeClipper Authors.
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

jest.mock('utils/object.mapper', () => ({}));

beforeEach(() => {
  global.request = { get: jest.fn() };
});

afterEach(() => {
  delete global.request;
});

it('ends loading and exposes an error when the initial log request fails', async () => {
  const store = new LogStore();
  request.get.mockRejectedValue({
    reason: 'agent Task log endpoint is unavailable',
  });

  await store.fetchStepLog({ taskName: 'task-1' });

  expect(store.isLoading).toBe(false);
  expect(store.isExpand).toBe(true);
  expect(store.logError).toBe('agent Task log endpoint is unavailable');
  expect(store.logdata).toBe('');
  expect(store.cumulativeSize).toBe(0);
});

it('retries from the last received offset without losing or duplicating logs', async () => {
  const store = new LogStore();
  store.isStepFinished = true;
  request.get
    .mockResolvedValueOnce({ content: 'first', deliverySize: 5, logSize: 11 })
    .mockRejectedValueOnce(new Error('connection lost'));

  await store.getStepLog({ taskName: 'task-1' });
  expect(store.isLoading).toBe(false);
  expect(store.logError).toBe('connection lost');
  expect(store.logdata).toBe('first');
  expect(store.cumulativeSize).toBe(5);

  request.get.mockResolvedValueOnce({
    content: 'second',
    deliverySize: 6,
    logSize: 11,
  });
  await store.getStepLog({ taskName: 'task-1', offset: store.cumulativeSize });

  expect(request.get).toHaveBeenLastCalledWith(
    'api/operations.kubeclipper.io/v1alpha1/operationtasks/task-1/logs',
    { offset: 5 }
  );
  expect(store.logError).toBe('');
  expect(store.isLoading).toBe(false);
  expect(store.logdata).toBe('firstsecond');
  expect(store.cumulativeSize).toBe(11);
});

it('ends loading and allows retry when expanding a failed log request', async () => {
  const store = new LogStore();
  request.get.mockRejectedValue(new Error('request failed'));

  await store.getStepLog({ taskName: 'task-1' });

  expect(store.isLoading).toBe(false);
  expect(store.logError).toBe('request failed');
});
