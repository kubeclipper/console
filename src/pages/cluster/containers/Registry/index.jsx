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
import { useRootStore } from 'stores';
import actionConfigs from './actions';

export default function Registry() {
  const { registryStore: store } = useRootStore();

  const columns = [
    {
      title: t('Name'),
      dataIndex: 'name',
    },
    {
      title: t('Registry Address'),
      dataIndex: 'host',
      render: (data, record) => `${record?.scheme}://${data}`,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
    },
    {
      title: t('Create Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
      isHideable: true,
    },
  ];

  const currentProps = {
    columns,
    authKey: 'localRegistry',
    module: 'registries',
    name: t('LocalRegistry'),
    searchFilters: [],
    actionConfigs,
    store,
    isShowDownLoadIcon: false,
    isShowEyeIcon: false,
    hideSearch: true,
    isAction: true,
  };

  return <BaseList {...currentProps} />;
}
