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

import {
  phoneNumberValidate,
  nameValidate,
  macAddressValidate,
  portRangeValidate,
  // passwordValidate,
  yamlValidator,
} from './validate';

describe('test vaildate', () => {
  it('phoneNumberValidate', async () => {
    const rule = {
      required: true,
    };

    const val1 = await phoneNumberValidate(rule, 13929291929);
    const val2 = phoneNumberValidate(rule, 110);
    const val3 = phoneNumberValidate(rule, 'string');

    expect(val1).toBe(true);
    expect(val2).rejects.toThrow();
    expect(val3).rejects.toThrow();
  });

  it('nameValidate', async () => {
    const val1 = await nameValidate('', 'key');
    const val2 = await nameValidate('', undefined);
    const val3 = nameValidate('', null);

    expect(val1).toBe(true);
    expect(val2).toBe(true);
    expect(val3).rejects.toThrow();
  });

  it('macAddressValidate', async () => {
    const val1 = await macAddressValidate('', '3D:F2:C9:A6:B3:4F');
    const val2 = macAddressValidate('', '3D:F2:C9:A6:B3:4F123');

    expect(val1).toBe(true);
    expect(val2).rejects.toThrow();
  });

  it('portRangeValidate', async () => {
    const val1 = await portRangeValidate('', '21244');
    const val2 = portRangeValidate('', '65536');

    expect(val1).toBe();
    expect(val2).rejects.toThrow();
  });

  // it('passwordValidate', async () => {
  //   const val = await passwordValidate(
  //     {
  //       field: 'password',
  //     },
  //     123456,
  //     {
  //       password: 123456,
  //       confirmPassword: 123456,
  //     }
  //   );

  //   expect(val).toBe();
  // });

  it('yamlValidator', async () => {
    const yaml = `
                kind: Deployment
                apiVersion: apps/v1
                metadata:
                  name: fdsff
                  namespace: test
                  labels:
                    app: fdsff
                `;

    const yaml2 = `
                  kind: Deployment
                  apiVersion: apps/v1
                  metadata:
                    name: fdsff
                      namespace: test
                    labels:
                      app: fdsff
                  `;

    const val1 = await yamlValidator('', yaml);
    const val2 = yamlValidator('', yaml2);

    expect(val1).toBe(true);
    expect(val2).rejects.toThrow();
  });
});
