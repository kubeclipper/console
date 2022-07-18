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

import { getRoles } from './node';

describe('test node', () => {
  it('getRoles', () => {
    expect(getRoles(0)).toEqual(['-']);
    expect(getRoles(1)).toEqual(['master']);
    expect(getRoles(2)).toEqual(['worker']);
    expect(getRoles(3)).toEqual(['master', 'worker']);
    expect(getRoles(4)).toEqual(['ingress']);
    expect(getRoles(5)).toEqual(['master', 'ingress']);
    expect(getRoles(6)).toEqual(['worker', 'ingress']);
    expect(getRoles(7)).toEqual(['master', 'worker', 'ingress']);
    expect(getRoles(8)).toEqual(['externalLB']);
    expect(getRoles(9)).toEqual(['master', 'externalLB']);
  });
});
