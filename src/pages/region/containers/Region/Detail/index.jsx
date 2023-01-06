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
import TabDetail from 'containers/TabDetail';
import { useRootStore } from 'stores';
import ClusterList from './ClusterList';
import NodeList from './NodeList';

function Detail() {
  const { regionStore: store } = useRootStore();

  const currentProps = {
    store,
    name: t('RegionDetail'),
    authKey: 'region-detail',
    listUrl: '/region',
    detailInfos: [
      {
        title: t('Name'),
        dataIndex: 'name',
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
        key: 'ClusterList',
        component: ClusterList,
      },
      {
        title: t('Node List'),
        key: 'NodeList',
        component: NodeList,
      },
    ],
  };

  return <TabDetail {...currentProps} />;
}

export default Detail;
