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
import { checkPolicy } from 'utils/policy';

/**
 * check allowed
 * @param {Object} item
 * @param {String} policy
 * @param {Function} allowed
 * @param {Object} containerProps
 * @returns Boolean
 */
export async function checkAllowed(item, policy, allowed, containerProps) {
  const policyResult = checkPolicy(policy);

  if (!policyResult) {
    return false;
  }

  let result = false;

  if (allowed) {
    result = allowed(item, containerProps);
    if (result instanceof Promise) {
      result = await result;
    }
  }

  return result;
}

/**
 *
 * @param {Array} actions
 * @param {Object} data
 * @param {String} key
 * @param {Object} containerProps
 * @returns Array
 */
export async function getAllowedResults(actions, data, key, containerProps) {
  const allowedPromises = actions.map(async (it) => {
    const result = checkAllowed(
      data,
      key ? it[key].policy : it.policy,
      key ? it[key].allowed : it.allowed,
      containerProps
    );

    return result;
  });

  const results = await Promise.all(allowedPromises);

  return results;
}

export function getAction(action, item, containerProps) {
  const { actionType } = action;

  if (actionType === 'confirm') {
    const Action = action;
    const actionIns = new Action({ item, containerProps });

    return actionIns;
  }

  return action;
}

/**
 *
 * @param {Array} actions
 * @param {Object} item
 * @param {Object} containerProps
 * @returns Object
 */
export function getActionList(actions, item, containerProps) {
  const { firstAction = null, moreActions = [] } = actions;
  const actionList = [];
  const newFirst = firstAction
    ? {
        action: getAction(firstAction, item, containerProps),
        allowedIndex: 0,
      }
    : null;
  const newMoreActions = [];

  if (firstAction) {
    actionList.push(newFirst);
  }

  moreActions.forEach((it) => {
    if (it.actions) {
      const newActions = [];

      it.actions.forEach((action) => {
        const newAction = {
          action: getAction(action, item, containerProps),
          allowedIndex: actionList.length,
        };
        newActions.push(newAction);
        actionList.push(newAction);
      });

      newMoreActions.push({
        ...it,
        actions: newActions,
      });
    } else if (it.action) {
      const newAction = {
        action: getAction(it.action, item, containerProps),
        allowedIndex: actionList.length,
      };

      newMoreActions.push(newAction);
      actionList.push(newAction);
    }
  });

  return {
    actionList,
    firstAction: newFirst,
    moreActions: newMoreActions,
  };
}
