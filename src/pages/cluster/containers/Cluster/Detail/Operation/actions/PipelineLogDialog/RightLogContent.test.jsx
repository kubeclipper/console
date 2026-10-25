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

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import RightLogContent from './RightLogContent';

let mockNodeStatus;
const mockLogStores = [];

jest.mock(
  'stores',
  () => ({
    useRootStore: () => ({
      operationStore: {
        currentNodesByStep: {
          nodes: [{ id: 'node-1', ipv4: '192.168.1.20' }],
          status: [mockNodeStatus],
        },
        activeStepIndex: 0,
      },
    }),
  }),
  { virtual: true }
);
jest.mock('stores/log', () => ({
  __esModule: true,
  default: class LogStore {
    logdata = '';

    isExpand = false;

    isLoading = false;

    cumulativeSize = 0;

    fetchStepLog = jest.fn(() => Promise.resolve());

    logReset = jest.fn();

    getStepLog = jest.fn(() => Promise.resolve());

    constructor() {
      mockLogStores.push(this);
    }
  },
}));
jest.mock('hooks', () => ({ useInterval: () => {} }), { virtual: true });
jest.mock('utils', () => ({ formatSeconds: () => '' }), { virtual: true });
jest.mock('mobx-react', () => ({ observer: (component) => component }));
jest.mock('antd', () => ({
  Spin: () => null,
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));
jest.mock('@ant-design/icons', () => ({
  CaretRightOutlined: () => null,
  CaretDownOutlined: () => null,
  CheckCircleFilled: () => null,
  CloseCircleFilled: () => null,
}));

describe('operation task failure', () => {
  beforeEach(() => {
    global.t = (value) => value;
  });

  it('shows the task error even when the log is empty and collapsed', () => {
    mockNodeStatus = {
      status: 'Failed',
      taskName: 'task-1',
      message: 'failed to restart unit containerd.service: failed',
    };

    const html = renderToStaticMarkup(<RightLogContent />);

    expect(html).toContain('role="alert"');
    expect(html).toContain(mockNodeStatus.message);
  });

  it('shows the reason when a failed task has no message', () => {
    mockNodeStatus = { status: 'TimedOut', reason: 'DeadlineExceeded' };

    expect(renderToStaticMarkup(<RightLogContent />)).toContain(
      'DeadlineExceeded'
    );
  });

  it('renders an error as text', () => {
    mockNodeStatus = {
      status: 'Failed',
      message: '<script>alert(1)</script>',
    };

    const html = renderToStaticMarkup(<RightLogContent />);

    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('fetches the final log tail when a running task fails', async () => {
    const { scrollIntoView } = Element.prototype;
    Element.prototype.scrollIntoView = jest.fn();
    let wrapper;
    try {
      mockNodeStatus = { status: 'Running', taskName: 'task-1' };
      await act(async () => {
        wrapper = mount(<RightLogContent />);
      });
      const logStore = mockLogStores[mockLogStores.length - 1];
      logStore.cumulativeSize = 64;
      mockNodeStatus = {
        ...mockNodeStatus,
        status: 'Failed',
        message: 'custom executor failed',
      };

      await act(async () => {
        wrapper.setProps({});
      });

      expect(logStore.fetchStepLog).toHaveBeenLastCalledWith({
        taskName: 'task-1',
        offset: 64,
      });
      expect(logStore.fetchStepLog).toHaveBeenCalledTimes(2);
      expect(wrapper.find('[role="alert"] pre').text()).toBe(
        'custom executor failed'
      );
    } finally {
      wrapper?.unmount();
      Element.prototype.scrollIntoView = scrollIntoView;
    }
  });
  it('keeps existing output visible during a refresh', async () => {
    mockNodeStatus = {
      status: 'Failed',
      taskName: 'task-refresh',
      message: 'original failure',
    };
    let wrapper;
    await act(async () => {
      wrapper = mount(<RightLogContent />);
    });
    const store = mockLogStores[mockLogStores.length - 1];
    store.logdata = 'ExecMainStatus=42';
    store.isLoading = true;
    await act(async () => {
      wrapper.setProps({});
    });
    expect(wrapper.text()).toContain('ExecMainStatus=42');
    expect(wrapper.text()).toContain('Execution logs');
    expect(wrapper.find('button[aria-expanded]').prop('aria-expanded')).toBe(
      true
    );
    wrapper.unmount();
  });
});
