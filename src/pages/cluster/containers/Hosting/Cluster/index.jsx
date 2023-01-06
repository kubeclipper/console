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
import React, { useEffect } from 'react';
import BaseList from 'containers/List';
import { transitionStatus, columns } from 'resources/cluster';
import actionConfigs from '../../Cluster/actions';
import { useRootStore } from 'stores';
import { cloneDeep } from 'lodash';
import Add from './actions/Add';
import Remove from './actions/Remove';

const newActionConfigs = cloneDeep(actionConfigs);
newActionConfigs.primaryActions = [Add];

const ClusterList = (props) => {
  const { clusterStore: store } = useRootStore();

  useEffect(() => {
    function postAction() {
      const {
        rowActions: { moreActions },
      } = newActionConfigs;

      [...moreActions].forEach((item) => {
        if (item.key === 'status') {
          item.actions = item.actions.filter(
            (ac) => ac.name !== 'DeleteAction'
          );

          item.actions.push(Remove);
        }
      });
    }

    postAction();
  }, []);

  const currentProps = {
    ...props,
    name: t('Cluster'),
    columns,
    searchFilters: [
      {
        label: t('Name'),
        name: 'name',
      },
    ],
    transitionStatusList: transitionStatus,
    actionConfigs: newActionConfigs,
    store,
  };

  return <BaseList {...currentProps} />;
};

export default ClusterList;
