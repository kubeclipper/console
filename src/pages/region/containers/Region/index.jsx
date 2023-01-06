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
import BaseList from 'containers/List';
import { useRootStore } from 'stores';
import actionConfigs from './actions';

export default function Region(props) {
  const { regionStore: store } = useRootStore();

  const columns = [
    {
      title: t('Region Name'),
      dataIndex: 'name',
      render: (name, record) => {
        if (name) {
          return <Link to={`/region/${record.id}`}>{name}</Link>;
        }
        return '-';
      },
      width: '30%',
    },
    {
      title: t('Create Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
      isHideable: true,
    },
  ];

  const currentProps = {
    ...props,
    columns,
    tabs: [],
    authKey: 'regions',
    module: 'regions',
    name: t('regions'),
    searchFilters: [
      {
        label: t('Region Name'),
        name: 'name',
      },
    ],
    actionConfigs,
    store,
  };

  return <BaseList {...currentProps} />;
}
