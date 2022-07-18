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
import { isFunction, isEmpty, isArray } from 'lodash';

/**
 * split policy to module & action
 * @param {String} policy
 * @returns Array
 */
const policyModuleFun = (policy) => {
  if (typeof policy !== 'string') {
    throw new Error('please check policy type!');
  }

  const [module, action] = policy.split(':');

  return [module, action];
};

/**
 *  check policy
 * @param {String/Function/Array} policy
 * @returns
 */
export const checkPolicy = (policy) => {
  if (isArray(policy)) {
    return policy.every((it) => {
      const [module, action] = policyModuleFun(it);

      return globals.hasPermission({ module, action });
    });
  }

  if (isFunction(policy)) {
    const policyValue = policy();

    if (!isEmpty(policyValue)) {
      const [module, action] = policyModuleFun(policyValue);

      return globals.hasPermission({ module, action });
    }
    return true;
  }

  if (policy) {
    const [module, action] = policyModuleFun(policy);

    return globals.hasPermission({ module, action });
  }

  return true;
};
