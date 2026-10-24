import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import PipelineLog from './index';

const mockStore = {
  list: {},
  reset: jest.fn(),
  currentNodesByStep: null,
  activeStepIndex: 0,
};
const mockOperation = { metadata: { name: 'op', uid: 'op-uid' } };
let mockWatch;

jest.mock(
  'containers/Action',
  () => ({
    ViewAction: class extends require('react').Component {
      get item() {
        return this.props.item;
      }

      render() {
        return this.renderContent();
      }
    },
  }),
  { virtual: true }
);
jest.mock(
  'stores',
  () => ({
    rootStore: {
      get operationStore() {
        return mockStore;
      },
    },
  }),
  { virtual: true }
);
jest.mock(
  'stores/websocket',
  () =>
    class {
      watch = jest.fn();

      close = jest.fn();
    }
);
jest.mock('utils/localStorage', () => ({ getToken: () => 'test-token' }));
jest.mock('utils/object.mapper', () => ({
  operations: (op, tasks) => ({
    status: 'Failed',
    operationSteps: [{ stepID: 'one', nodes: [], status: tasks }],
  }),
}));
jest.mock('mobx', () => ({
  toJS: (v) => v,
  reaction: (get, cb) => {
    mockWatch = cb;
    return jest.fn();
  },
}));
jest.mock('./LeftSteps', () => () => null);
jest.mock('./RightLogContent', () => () => <div>task logs</div>);
jest.mock('antd', () => ({
  Alert: ({ message, description, action }) => (
    <div role="alert">
      {message}: {description}
      {action}
    </div>
  ),
  Button: ({ onClick, children }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

const errorShapes = {
  message: (message) => new Error(message),
  reason: (reason) => ({ reason }),
  'reason with generic message': (reason) => ({
    reason,
    message: 'Internal server error',
  }),
};

describe.each(Object.keys(errorShapes))('read errors: %s', (errorShape) => {
  const makeError = errorShapes[errorShape];
  beforeEach(() => {
    jest.useFakeTimers();
    global.t = (v) => v;
    mockStore.currentNodesByStep = null;
  });
  afterEach(() => {
    jest.useRealTimers();
    delete global.request;
  });
  it('shows an initial operation failure and recovers with the retry button', async () => {
    global.request = {
      get: jest
        .fn()
        .mockRejectedValueOnce(makeError('operation unavailable'))
        .mockResolvedValueOnce(mockOperation)
        .mockResolvedValueOnce({ items: [] }),
    };
    let wrapper;
    await act(async () => {
      wrapper = mount(<PipelineLog item={{ name: 'op' }} />);
    });
    wrapper.update();
    expect(wrapper.find('[role="alert"]').text()).toContain(
      'operation unavailable'
    );
    await act(async () => {
      wrapper.find('button').simulate('click');
    });
    wrapper.update();
    expect(wrapper.find('[role="alert"]')).toHaveLength(0);
    expect(mockStore.currentNodesByStep.stepID).toBe('one');
    wrapper.unmount();
  });
  it('retains the last task snapshot on a task query failure then recovers', async () => {
    global.request = {
      get: jest
        .fn()
        .mockResolvedValueOnce(mockOperation)
        .mockResolvedValueOnce({ items: [] })
        .mockRejectedValueOnce(makeError('task unavailable'))
        .mockResolvedValueOnce({ items: [] }),
    };
    let wrapper;
    await act(async () => {
      wrapper = mount(<PipelineLog item={{ name: 'op' }} />);
    });
    const snapshot = mockStore.currentNodesByStep;
    await act(async () => {
      await wrapper.instance().refreshTasks();
    });
    wrapper.update();
    expect(wrapper.find('[role="alert"]').text()).toContain('task unavailable');
    expect(mockStore.currentNodesByStep).toBe(snapshot);
    await act(async () => {
      wrapper.find('button').simulate('click');
    });
    wrapper.update();
    expect(wrapper.find('[role="alert"]')).toHaveLength(0);
    wrapper.unmount();
  });
  it('shows task errors from the operation watch without an unhandled rejection', async () => {
    global.request = {
      get: jest
        .fn()
        .mockResolvedValueOnce(mockOperation)
        .mockResolvedValueOnce({ items: [] })
        .mockRejectedValueOnce(makeError('watch task unavailable')),
    };
    let wrapper;
    await act(async () => {
      wrapper = mount(<PipelineLog item={{ name: 'op' }} />);
    });
    await act(async () => {
      mockWatch({ type: 'MODIFIED', object: { ...mockOperation } });
    });
    wrapper.update();
    expect(wrapper.find('[role="alert"]').text()).toContain(
      'watch task unavailable'
    );
    wrapper.unmount();
  });
});
