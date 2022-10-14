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

import { safeBtoa, safeAtob } from './base64';

describe('test base64', () => {
  it('safeBtoa', () => {
    const data = 'iam.kubeclipper.io/v1';
    const val = safeBtoa(data);

    const data2 = {};
    const val2 = safeBtoa(data2);

    expect(val).toBe('aWFtLmt1YmVjbGlwcGVyLmlvL3Yx');
    expect(val2).toBe('');
  });

  it('safeAtob', () => {
    const data = 'aWFtLmt1YmVjbGlwcGVyLmlvL3Yx';
    const val = safeAtob(data);

    const data2 = {};
    const val2 = safeAtob(data2);

    expect(val).toBe('iam.kubeclipper.io/v1');
    expect(val2).toBe('');
  });
});
