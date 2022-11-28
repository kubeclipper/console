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
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import TabDetail from 'containers/TabDetail';
import { isEmpty } from 'lodash';
import { clusterStatus, transitionStatus } from 'resources/cluster';
import { useRootStore } from 'stores';
import actionConfigs from '../actions';
import BackUp from './Backup';
import BaseDetail from './BaseDetail';
import NodesList from './NodesList';
import Operation from './Operation';
import Plugins from './Plugins';
import ScheduledBackup from './ScheduledBackup';
import Storage from './Storage';

const StatusTitle = () => (
  <span>
    {t('Cluster Status')}&nbsp;
    <Tooltip
      title={t(
        'If status is not updated automatically, please refresh the page manually.'
      )}
    >
      <QuestionCircleOutlined />
    </Tooltip>
  </span>
);

function ClusterDetail() {
  const { clusterStore: store } = useRootStore();

  const allowedCheckProviderType = (item) => item.providerType !== 'rancher';
  const allowedCheckComponents = (item, key) => !isEmpty(item[key]);

  const currentProps = {
    name: t('ClusterDetail'),
    listUrl: '/cluster',
    actionConfigs,
    store,
    transitionStatusList: transitionStatus,
    tabs: [
      {
        title: t('BaseDetail'),
        key: 'BaseDetail',
        component: BaseDetail,
      },
      {
        title: t('Storage'),
        key: 'Storage',
        component: Storage,
        allowed: (item) => allowedCheckComponents(item, 'storage'),
      },
      {
        title: t('Plugins'),
        key: 'Plugins',
        component: Plugins,
        allowed: (item) => allowedCheckComponents(item, 'plugin'),
      },
      {
        title: t('Nodes List'),
        key: 'NodesList',
        component: NodesList,
      },
      {
        title: t('Operation Log'),
        key: 'Operation',
        component: Operation,
      },
      {
        title: t('BackUp'),
        key: 'BackUp',
        component: BackUp,
        allowed: allowedCheckProviderType,
      },
      {
        title: t('Scheduled Backup'),
        key: 'ScheduledBackup',
        component: ScheduledBackup,
        allowed: allowedCheckProviderType,
      },
    ],
    detailInfos: [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: <StatusTitle />,
        dataIndex: 'status',
        render: (data) => clusterStatus[data] || data,
      },
      {
        title: t('Region'),
        dataIndex: 'region',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Created At'),
        dataIndex: 'createTime',
        valueRender: 'sinceTime',
      },
      {
        title: t('Updated At'),
        dataIndex: 'date_modified',
        valueRender: 'sinceTime',
      },
    ],
  };
  return <TabDetail {...currentProps} />;
}

export default ClusterDetail;
