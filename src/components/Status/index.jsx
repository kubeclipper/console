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
import PropTypes from 'prop-types';
import { Badge, Tooltip } from 'antd';
import { isBoolean, isString } from 'lodash';

const statusMap = {
  enabled: 'success',
  running: 'success',
  Installing: 'processing',
  Updating: 'processing',
  Upgrading: 'processing',
  BackingUp: 'processing',
  Restoring: 'processing',
  Terminating: 'processing',
  up: 'success',
  active: 'success',
  available: 'success',
  'in-use': 'success',
  error: 'error',
  error_deleting: 'error',
  success: 'success',
  successful: 'success',
  failed: 'error',
  new: 'success',
  processing: 'processing',
  ready: 'success',
  removeing: 'processing',
  readyToUpgrade: 'success',
  'N/A': 'yellow',
  failedValidation: 'error',
  inProgress: 'processing',
  completed: 'success',
  partiallyFailed: 'error',
  syncing: 'processing',
};

function Status(props) {
  const { status, text, errIgnore = false, hoverText } = props;
  let realStatus = 'default';

  if (isBoolean(status)) {
    realStatus = status ? 'success' : 'error';
  } else if (isString(status)) {
    realStatus = statusMap[status.toLowerCase()] || 'default';

    if (errIgnore && status === 'failed') {
      realStatus = 'yellow';
    }
  }

  if (hoverText) {
    return (
      <Tooltip placement="top" title={hoverText}>
        <Badge status={realStatus} text={text} />
      </Tooltip>
    );
  }

  return <Badge status={realStatus} text={text} />;
}

Status.propTypes = {
  status: PropTypes.any,
  text: PropTypes.string,
  hoverText: PropTypes.node,
};

Status.defaultProps = {
  status: 'enabled',
  text: 'Enabled',
  hoverText: null,
};

export default Status;
