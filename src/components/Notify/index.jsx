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
import { notification } from 'antd';
import PropTypes from 'prop-types';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { statusMap } from 'utils/constants';
import { isEmpty, isString } from 'lodash';
import styles from './index.less';

const open = (args) => {
  const { title = t('Error'), type = 'error', description = '' } = args;

  let iconColor = '#F5222D';
  let icon = null;

  if (type === 'info') {
    iconColor = '#0068FF';
    icon = <InfoCircleOutlined theme="filled" style={{ color: iconColor }} />;
  } else if (type === 'success') {
    iconColor = '#57E39B';
    icon = <CheckCircleOutlined theme="filled" style={{ color: iconColor }} />;
  } else if (type === 'error') {
    iconColor = '#EB354D';
    icon = <CloseCircleOutlined theme="filled" style={{ color: iconColor }} />;
  } else if (type === 'process') {
    iconColor = '#0068FF';
    icon = <LoadingOutlined style={{ color: iconColor }} />;
  } else if (type === 'warn') {
    iconColor = '#FEDF40';
    icon = <InfoCircleOutlined theme="filled" style={{ color: iconColor }} />;
  }

  const duration = type === 'error' ? 0 : 4.5;

  notification.open({
    message: title,
    duration,
    icon,
    description,
    className: styles.notify,
  });
};

open.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  description: PropTypes.string,
};

export const success = (title, description) => {
  open({
    title,
    description,
    type: 'success',
  });
};

export const info = (title, description) => {
  open({
    title,
    description,
    type: 'info',
  });
};

export const error = (title, description) => {
  open({
    title,
    description,
    type: 'error',
  });
};

export const warn = (title, description) => {
  open({
    title,
    description,
    type: 'warn',
  });
};

export const process = (title, description) => {
  open({
    title,
    description,
    type: 'process',
  });
};

const errorWithDetail = (err, title) => {
  const { status: code, message } = err || {};

  let nTitle = title;
  let description;
  if (code && parseInt(code, 10) >= 500) {
    if (!isEmpty(message) && !statusMap[code]) {
      if (isString(message)) {
        nTitle += `${t('message')}${t('.')}`;
      } else if (message.reason) {
        nTitle += `${t('message.reason')}${t('.')}`;
      }
      nTitle += `${t('Status Code')}: ${code}`;
    } else {
      nTitle += statusMap[code];
    }
  } else {
    description = err?.reason;
  }

  error(nTitle, description);
};

export default {
  open,
  success,
  error,
  warn,
  info,
  process,
  errorWithDetail,
};
