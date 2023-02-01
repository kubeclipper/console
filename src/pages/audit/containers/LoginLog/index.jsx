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
import BaseList from 'containers/List';
import { useRootStore } from 'stores';
import { auditStatus } from 'resources/audit';

export default function LoginLog(props) {
  const { auditStore: store } = useRootStore();

  const columns = [
    {
      title: t('Operation Type'),
      dataIndex: 'type',
    },
    {
      title: t('Operation Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
      isHideable: true,
    },
    {
      title: t('User Name'),
      dataIndex: 'username',
      isHideable: true,
    },
    {
      title: t('IP Address'),
      dataIndex: 'ip',
      isHideable: true,
    },
    {
      title: t('Client Agent'),
      dataIndex: 'clientId',
      isHideable: true,
    },
    {
      title: t('Operation Status'),
      dataIndex: 'status',
      render: (data) => auditStatus[data] || data,
    },
  ];

  const currentProps = {
    ...props,
    columns,
    authKey: 'loginLog',
    module: 'loginLog',
    name: t('Login Log'),
    searchFilters: [
      {
        label: t('Username'),
        name: 'username',
      },
      {
        label: t('Operation Type'),
        name: 'type',
        exact: true,
      },
      {
        label: t('IP Address'),
        name: 'ip',
      },
    ],
    isAction: false,
    store,
    propsParams: {
      fieldSelector: 'type!=',
    },
  };

  return <BaseList {...currentProps} />;
}
