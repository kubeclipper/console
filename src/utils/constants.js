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
import { InboxOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';

export const MODULE_KIND_MAP = {
  users: 'User',
  roles: 'GlobalRole',
  nodes: 'Node',
};

export const LANG_MAP = {
  zh: 'zh-cn',
  en: 'en',
};

export const TIME_MICROSECOND_MAP = {
  '1h': 3600000,
  '2h': 7200000,
  '3h': 10800000,
  '6h': 21600000,
  '12h': 43200000,
  '24h': 86400000,
  '2d': 172800000,
};

export const MILLISECOND_IN_TIME_UNIT = {
  s: 1000,
  m: 60000,
  h: 3600000,
  d: 86400000,
  w: 604800000,
};

export const SECOND_IN_TIME_UNIT = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  month: 2592000,
  year: 31536000,
};

export const MAX_SIZE_UPLOAD = 2 * 1024 * 1024;

const kb = 1024;
const mb = kb * 1024;
const gb = mb * 1024;
const tb = gb * 1024;

export const SIZE_VALUE = {
  kb,
  mb,
  gb,
  tb,
};

export const iconTypeMap = {
  network: <GlobalOutlined />,
  volume: <InboxOutlined />,
  user: <UserOutlined />,
};

export const INTERNAL_ROLE_DES = {
  'cluster-manager': 'CLUSTER_MANAGER',
  'iam-manager': 'IAM_MANAGER',
  'platform-admin': 'PLATFORM_ADMIN',
  'platform-view': 'PLATFORM_VIEW',
};

export const MODULE_ROUTE = {
  clusters: '/cluster',
  users: '/access/user',
  platform: '/configuration/global-settings',
  empty: '/auth/empty-role',
};

export const statusMap = {
  500: 'Internal Server Error (code: 500) ',
  501: 'Not Implemented (code: 501) ',
  502: 'Bad Gateway (code: 502) ',
  503: 'Service Unavailable (code: 503) ',
  504: 'Gateway Time-out (code: 504) ',
  505: 'HTTP Version not supported (code: 505)',
};

export const APIVERSION = {
  core: 'api/core.kubeclipper.io/v1',
  iam: 'api/iam.kubeclipper.io/v1',
  config: 'api/config.kubeclipper.io/v1',
  audit: 'api/audit.kubeclipper.io/v1',
};
