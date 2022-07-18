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
import Base from 'containers/BaseDetail';
import { useRootStore } from 'stores';

export default function BaseDetail() {
  const { nodeStore: store } = useRootStore();

  const baseInfoCard = {
    title: t('Base Info'),
    options: [
      {
        label: t('Host Name'),
        dataIndex: 'hostname',
      },
      {
        label: t('IP'),
        dataIndex: 'ip',
      },
      {
        label: t('Default Gateway'),
        dataIndex: 'ipv4DefaultGw',
      },
      {
        label: t('Region'),
        dataIndex: 'region',
      },
      {
        label: t('Node ID'),
        dataIndex: 'name',
      },
    ],
  };

  const systemCard = {
    title: t('System Info'),
    options: [
      {
        label: t('OS'),
        dataIndex: 'nodeInfo.os',
      },
      {
        label: t('Version'),
        dataIndex: 'nodeInfo',
        render: (data) => `${data.platform} ${data.platformVersion}`,
      },
      {
        label: t('CPU'),
        dataIndex: 'cpu',
      },
      {
        label: t('Memory'),
        dataIndex: 'memory',
      },
      {
        label: t('Storage'),
        dataIndex: 'storage',
      },
    ],
  };

  const currentProps = {
    store,
    cards: [baseInfoCard, systemCard],
  };

  return <Base {...currentProps} />;
}
