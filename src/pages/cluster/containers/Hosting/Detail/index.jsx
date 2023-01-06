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
import { useRootStore } from 'stores';
import BaseTabDetail from 'containers/TabDetail';
import Clusters from './Clusters';

import actionConfigs from '../actions';

export default function Detail(props) {
  const { cloudProviderStore: store } = useRootStore();

  const currentProps = {
    ...props,
    name: t('Provider Detail'),
    listUrl: '/cluster/hosting',
    store,
    actionConfigs,
    detailInfos: [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Provider Type'),
        dataIndex: 'type',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Create Time'),
        dataIndex: 'createTime',
        valueRender: 'toLocalTime',
      },
    ],
    tabs: [
      {
        title: t('Cluster List'),
        key: 'cluster',
        component: Clusters,
      },
    ],
  };

  return <BaseTabDetail {...currentProps} />;
}
