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
import { getNodeRole } from 'resources/node';
import { getLocalStorageItem } from 'utils/localStorage';
import BaseTabDetail from 'containers/TabDetail';
import BaseDetail from './BaseDetail';
import { useRootStore } from 'stores';
import actionConfigs from '../actions';

function NodeDetail(props) {
  const { nodeStore: store } = useRootStore();

  const hasClusterPermission = () => {
    const { permission } = getLocalStorageItem('user');
    // eslint-disable-next-line no-bitwise
    return (permission & 1) === 1;
  };

  const currentProps = {
    ...props,
    name: t('NodeDetail'),
    authKey: 'node-detail',
    listUrl: '/node',
    store,
    actionConfigs,
    tabs: [
      {
        title: t('BaseDetail'),
        key: 'BaseDetail',
        component: BaseDetail,
      },
    ],
    detailInfos: [
      {
        title: t('IP'),
        dataIndex: 'ip',
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
      {
        title: t('Belong To Cluster'),
        dataIndex: 'belongToCluster',
        render: (data) => {
          if (!data) return '-';
          if (!hasClusterPermission()) {
            return data;
          }
          return <Link to={`/cluster/${data}`}>{data}</Link>;
        },
      },
    ],
  };

  return <BaseTabDetail {...currentProps} />;
}

export default NodeDetail;
