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
import { toLocalTime, formatCron } from 'utils';
import * as resourcesDate from 'resources/date';
import { useParams } from 'react-router-dom';

function ScheduledBackup() {
  const { cornBackupStore: store } = useRootStore();
  const { id } = useParams();

  const columns = [
    {
      title: t('Name'),
      dataIndex: 'name',
    },
    {
      title: t('Type'),
      dataIndex: 'type',
      render: (type) => t(`${type}`),
    },
    {
      title: t('Cycle'),
      dataIndex: 'schedule',
      render: (val) => {
        if (val) {
          const { cycle, localsFormat } = formatCron(val);
          let { values } = formatCron(val);
          values = values.length
            ? values.map((item) => resourcesDate[localsFormat][item])
            : [];
          return `${t(`${cycle}`)}${values.length ? '：' : ''} ${values.join(
            ','
          )}`;
        }
        return '';
      },
    },
    {
      title: t('Time'),
      dataIndex: 'type',
      render: (_, data) => {
        const { type, runAt, schedule } = data;
        if (type === 'OnlyOnce') {
          return toLocalTime(runAt);
        } else {
          const { time } = formatCron(schedule);
          return time;
        }
      },
    },
    {
      title: t('Enable'),
      dataIndex: 'enabled',
      isHideable: true,
      isStatus: true,
      render: (data) => (data ? t('Yes') : t('No')),
    },
    {
      title: t('Create Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
    },
  ];

  const currentProps = {
    name: t('Scheduled Backup'),
    module: 'cronBackup',
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
    getData,
    isRenderFooter: false,
  };

  async function getData(params) {
    await store.fetchList({ id, limit: -1, ...params });
  }

  return <BaseList {...currentProps} />;
}

export default observer(ScheduledBackup);
