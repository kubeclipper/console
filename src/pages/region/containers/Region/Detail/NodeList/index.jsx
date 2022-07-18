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
import { Link, useParams } from 'react-router-dom';
import actionConfigs from 'pages/node/containers/Node/actions';
import BaseList from 'src/containers/List';
import { getNodeRole } from 'resources/node';
import { useRootStore } from 'stores';

export default function Node() {
  const { nodeStore: store } = useRootStore();
  const { id } = useParams();

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
      render: (name) => t(`${name}`),
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

  async function getData(params) {
    const labelSelector = `topology.kubeclipper.io/region=${id}`;
    await store.fetchList({ labelSelector, ...params });
  }

  const currentProps = {
    columns,
    store,
    module: 'node',
    name: t('node'),
    actionConfigs,
    searchFilters: [
      {
        label: t('IP'),
        name: 'ip',
      },
    ],
    getData,
  };

  return <BaseList {...currentProps} />;
}
