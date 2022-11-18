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
import { transitionStatus, columns } from 'resources/cluster';
import actionConfigs from './actions';
import { useRootStore } from 'stores';

const ClusterList = (props) => {
  const { clusterStore: store } = useRootStore();

  const currentProps = {
    ...props,
    name: t('Cluster'),
    columns: columns(props),
    searchFilters: [
      {
        label: t('Name'),
        name: 'name',
      },
    ],
    transitionStatusList: transitionStatus,
    actionConfigs,
    store,
    showProjectColumn: true,
  };

  return <BaseList {...currentProps} />;
};

export default ClusterList;
