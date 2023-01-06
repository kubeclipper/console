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
import { observer } from 'mobx-react';
import BaseList from 'containers/List';
import { useRootStore } from 'stores';
import actionConfigs from './actions';
import { getNodeRole } from 'resources/node';
import { useParams } from 'react-router-dom';

function NodeList() {
  const { nodeStore: store, clusterStore } = useRootStore();
  const { id } = useParams();

  const columns = [
    {
      title: t('Node IP'),
      dataIndex: 'ip',
      extraNameIndex: 'hostname',
      copyable: true,
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
      render: (data) => data && t(data),
    },
    {
      title: t('Role'),
      dataIndex: 'role',
      render: (data) => getNodeRole(data) || '-',
    },
  ];

  const currentProps = {
    detail: clusterStore.detail,
    name: t('node list'),
    module: 'node',
    columns,
    searchFilters: [
      {
        label: t('Ip'),
        name: 'ip',
      },
    ],
    transitionStatusList: ['Removeing', 'unAvailable', 'NotReady', 'checking'],
    actionConfigs,
    store,
    transitionDataIndex: 'kube_node_stat',
    getData,
  };

  async function getData(params) {
    store.list.silent = true;

    const labelSelector = `kubeclipper.io/cluster=${id}`;
    await store.fetchList({ labelSelector, ...params });
  }

  return <BaseList {...currentProps} />;
}

export default observer(NodeList);
