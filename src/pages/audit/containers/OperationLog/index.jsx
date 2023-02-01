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
import { userOperationStatus } from 'resources/user';

export default function OperationLog(props) {
  const { auditStore: store } = useRootStore();

  const columns = [
    {
      title: t('Operation Type'),
      dataIndex: 'verb',
    },
    {
      title: t('Operation Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
      isHideable: true,
    },
    {
      title: t('Request URI'),
      dataIndex: 'requestURI',
    },
    {
      title: t('Resource ID'),
      dataIndex: 'resourceId',
    },
    {
      title: t('Resource Type'),
      dataIndex: 'resource',
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
      title: t('Status'),
      dataIndex: 'status',
      render: (data) => userOperationStatus[data] || data,
    },
  ];

  const currentProps = {
    ...props,
    columns,
    authKey: 'operationLog',
    module: 'operationLog',
    name: t('Operation Log'),
    searchFilters: [
      {
        label: t('Username'),
        name: 'username',
      },
      {
        label: t('Operation Type'),
        name: 'verb',
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
      fieldSelector: 'type=',
    },
  };

  return <BaseList {...currentProps} />;
}
