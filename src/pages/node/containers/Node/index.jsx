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
import { Link } from 'react-router-dom';
import BaseList from 'containers/List';
import actionConfigs from './actions';
import { getNodeRole } from 'resources/node';
import { useRootStore } from 'stores';

export default function Node(props) {
  const { nodeStore: store } = useRootStore();

  const columns = [
    {
      title: t('Name'),
      dataIndex: 'ip',
      extraNameIndex: 'ip',
      extraNameCopyable: true,
      width: 200,
      render: (_, record) => (
        <Link to={`/node/${record.id}`}>{record.hostname}</Link>
      ),
    },
    {
      title: t('Region'),
      dataIndex: 'region',
      isHideable: true,
    },
    {
      title: t('CPU'),
      dataIndex: 'cpu',
      isHideable: true,
    },
    {
      title: t('Memory'),
      dataIndex: 'memory',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      isHideable: true,
      render: (data) => data && t(data),
    },
    {
      title: t('Enable'),
      dataIndex: 'disabled',
      isHideable: true,
      isStatus: true,
      render: (data) => (data ? t('Yes') : t('No')),
    },
    {
      title: t('Role'),
      dataIndex: 'role',
      render: (_, record) => {
        const { role } = record;
        return <span>{getNodeRole(role)}</span>;
      },
    },
  ];

  const currentProps = {
    ...props,
    module: 'node',
    name: t('node'),
    searchFilters: [
      {
        label: t('IP'),
        name: 'default-ip',
      },
    ],
    store,
    columns,
    actionConfigs,
  };

  return <BaseList {...currentProps} />;
}
