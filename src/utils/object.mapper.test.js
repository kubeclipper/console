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

import ObjectMapper from './object.mapper';

jest.mock('resources/node', () => ({ status: {} }), { virtual: true });
jest.mock(
  'utils',
  () => ({ formatRoleRules: jest.fn(), safeParseJSON: jest.fn() }),
  { virtual: true }
);
jest.mock('utils/constants', () => ({ INTERNAL_ROLE_DES: {} }), {
  virtual: true,
});
jest.mock(
  'resources/common',
  () => ({
    computeAutoDetectionReversion: jest.fn(),
  }),
  { virtual: true }
);

describe('operation mapper', () => {
  const operation = {
    metadata: {
      name: 'operation-1',
      uid: 'operation-uid',
      creationTimestamp: '2026-09-07T00:00:00Z',
    },
    spec: {
      action: 'CreateCluster',
      steps: [
        {
          id: 'step-1',
          targets: [{ name: 'node-1', uid: 'node-uid', ip: '10.0.0.1' }],
          payload: { step: { name: 'installRuntime' } },
        },
      ],
    },
    status: { phase: 'Running' },
  };

  it('does not treat the Array.map index as operation tasks', () => {
    const result = [operation].map(ObjectMapper.operations)[0];

    expect(result.operationSteps[0].nodes[0].status).toBe('Pending');
    expect(result.operationSteps[0].nodes[0].ipv4).toBe('10.0.0.1');
    expect(result.operationSteps[0].name).toBe('installRuntime');
  });

  it('uses an explicitly supplied operation task list', () => {
    const result = ObjectMapper.operations(operation, [
      {
        metadata: { name: 'task-1', creationTimestamp: '2026-09-07T00:00:01Z' },
        spec: {
          stepID: 'step-1',
          nodeRef: { name: 'node-1', uid: 'node-uid' },
        },
        status: { phase: 'Succeeded' },
      },
    ]);

    expect(result.operationSteps[0].nodes[0].status).toBe('Succeeded');
    expect(result.operationSteps[0].nodes[0].taskName).toBe('task-1');
  });

  it('uses the task node IP when the operation target omits it', () => {
    const operationWithoutTargetIP = {
      ...operation,
      spec: {
        ...operation.spec,
        steps: [
          {
            ...operation.spec.steps[0],
            targets: [{ name: 'node-1', uid: 'node-uid' }],
          },
        ],
      },
    };
    const result = ObjectMapper.operations(operationWithoutTargetIP, [
      {
        metadata: { name: 'task-1' },
        spec: {
          stepID: 'step-1',
          nodeRef: { name: 'node-1', uid: 'node-uid', ip: '10.0.0.2' },
        },
        status: { phase: 'Running' },
      },
    ]);

    expect(result.operationSteps[0].nodes[0].ipv4).toBe('10.0.0.2');
  });
});
