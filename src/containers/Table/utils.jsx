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

import React from 'react';
import { isString, get, isArray } from 'lodash';
import { Tooltip } from 'antd';
import Status from 'components/Status';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { renderFilterMap } from 'utils';
import { getAction } from 'utils/allowed';
import { checkPolicy } from 'utils/policy';

/**
 * 判断是否是状态相关字段
 * @param {*} dataIndex
 * @param {*} isStatus
 * @returns
 */
export const checkIsStatusColumn = (dataIndex, isStatus) => {
  if (isStatus) {
    return true;
  }
  return (
    isString(dataIndex) &&
    (dataIndex.toLowerCase().indexOf('status') >= 0 ||
      dataIndex.toLowerCase().indexOf('state') >= 0)
  );
};

/**
 * render status
 * @param {*} render
 * @returns
 */
export const getStatusRender = (render) => (value) => {
  const text = render ? render(value) : value;
  return <Status status={value} text={text} />;
};

/**
 *
 * @param {*} tip
 * @param {*} render
 * @param {*} dataIndex
 * @returns
 */
export const getTipRender = (tip, render, dataIndex) => {
  const newRender = (value, record) => {
    const tipValue = tip(value, record);
    const realValue = render ? render(value, record) : get(record, dataIndex);
    if (!tipValue) {
      return realValue;
    }
    return (
      <div>
        {realValue}
        <Tooltip title={tipValue}>
          <QuestionCircleOutlined style={{ marginLeft: 8 }} />
        </Tooltip>
      </div>
    );
  };
  return newRender;
};

export const getRender = (valueRender) => {
  if (!valueRender) {
    return null;
  }
  return (value) => {
    const func = isString(valueRender) ? renderFilterMap[valueRender] : null;
    if (func) {
      return func(value);
    }
    return '-';
  };
};

export const getDataIndex = (dataIndex) => {
  if (isArray(dataIndex)) {
    return dataIndex.join(',');
  }
  return dataIndex;
};

/**
 * 是否存在操作栏
 * @returns
 */
export const hasItemActions = (rowActions) => {
  const { firstAction, moreActions, actionList } = rowActions;

  if (firstAction) {
    return true;
  }
  if (moreActions && moreActions.length) {
    return true;
  }
  return actionList && actionList.length > 0;
};

/**
 *
 * @param {*} containerProps
 * @param {*} batchActions
 * @returns
 */
export const batchActionList = (containerProps, batchActions) => {
  const getActionList = (actions) =>
    actions.map((it) => getAction(it, null, containerProps));

  const filterActionByPolicy = (actionList) =>
    actionList.filter((it) => checkPolicy(it.policy));

  const actionList = filterActionByPolicy(getActionList(batchActions));

  return actionList;
};
