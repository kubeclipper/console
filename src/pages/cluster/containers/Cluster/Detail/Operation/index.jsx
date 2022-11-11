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
import React, { useMemo } from 'react';
import BaseList from 'containers/List';
import { operationStatus } from 'resources/cluster';
import { useRootStore } from 'stores';
import { observer } from 'mobx-react';
import actionConfigs from './actions';
import { useParams } from 'react-router-dom';

function OperationList() {
  const { operationStore: store, clusterStore } = useRootStore();
  const { id } = useParams();

  const columns = [
    {
      title: t('Operation Id'),
      dataIndex: 'name',
    },
    {
      title: t('Operation Name'),
      dataIndex: 'operationName',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      render: (data) => operationStatus[data],
      isHideable: true,
    },
    {
      title: t('Create Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
      isHideable: true,
    },
  ];
  const currentProps = {
    name: t('Operation Record'),
    rowKey: 'id',
    columns,
    searchFilters: [
      {
        label: t('Operation Name'),
        name: 'operationName',
      },
    ],
    transitionStatusList: ['running'],
    actionConfigs,
    store,
    detail: clusterStore.detail,
    transitionDataIndex: 'status',
    getData,
  };

  async function getData(params) {
    const labelSelector = `kubeclipper.io/cluster=${id}`;

    await store.fetchList({ labelSelector, ...params });
  }

  return useMemo(() => <BaseList {...currentProps} />, [store.detail]);
}

export default observer(OperationList);
