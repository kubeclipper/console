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
import { columns, transitionStatus } from 'resources/cluster';
import { useRootStore } from 'stores';
import { cloneDeep } from 'lodash';
import { useParams } from 'react-router-dom';

export default function Cluster() {
  const { clusterStore: store } = useRootStore();
  const { id } = useParams();

  const providerColumn = {
    title: t('Provider Name/Type'),
    dataIndex: 'providerName',
    isHideable: true,
    extraNameIndex: 'providerType',
    width: 150,
  };

  const newColumns = cloneDeep(columns).insert(1, providerColumn);

  const currentProps = {
    store,
    columns: newColumns,
    module: 'cluster',
    name: 'cluster',
    transitionStatusList: transitionStatus,
    transitionDataIndex: 'status',
    searchFilters: [
      {
        label: t('Name'),
        name: 'name',
      },
    ],
    getData,
  };

  async function getData(params) {
    const labelSelector = `kubeclipper.io/clusterProviderName=${id}`;
    await store.fetchList({ labelSelector, ...params });
  }

  return <BaseList {...currentProps} />;
}
