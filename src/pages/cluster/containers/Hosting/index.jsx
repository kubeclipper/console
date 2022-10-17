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
import { Link } from 'react-router-dom';
import BaseList from 'containers/List';
import { useRootStore } from 'stores';
import StatusReason from 'components/StatusReason';
import { get } from 'lodash';

import actionConfigs from './actions';

function Providers(props) {
  const { cloudProviderStore: store } = useRootStore();

  const columns = [
    {
      title: t('Provider Name'),
      dataIndex: 'name',
      render: (name, record) => {
        if (name) {
          return (
            <>
              <Link to={`/cluster/hosting/${record.id}`}>{name}</Link>
              {!get(record, 'status.status') && (
                <StatusReason data={record} reason={record.phase} />
              )}
            </>
          );
        }
        return '-';
      },
    },
    {
      title: t('Type'),
      dataIndex: 'type',
      isHideable: true,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
    },
    {
      title: t('Region'),
      dataIndex: 'region',
      isHideable: true,
    },
    {
      title: t('Create Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
    },
  ];

  const currentProps = {
    ...props,
    columns,
    module: 'cloudproviders',
    name: t('Cloudprovider'),
    transitionDataIndex: 'phase',
    transitionStatusList: ['Syncing', 'Removing', 'Created'],
    searchFilters: [
      {
        label: t('Name'),
        name: 'name',
      },
    ],
    actionConfigs,
    store,
  };

  return <BaseList {...currentProps} />;
}

export default observer(Providers);
