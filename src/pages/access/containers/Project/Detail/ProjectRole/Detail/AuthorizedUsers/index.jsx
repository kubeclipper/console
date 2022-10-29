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
import actionConfigs from './actions';
import BaseList from 'src/containers/List';
import { useRootStore } from 'stores';
import { useParams } from 'react-router-dom';

export default function AuthorizedUsers() {
  const { userStore } = useRootStore();
  const { id } = useParams();

  const columns = [
    {
      title: t('Users'),
      dataIndex: 'name',
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      isHideable: true,
    },
    {
      title: t('Role'),
      dataIndex: 'role',
      isHideable: true,
    },
    {
      title: t('E-mail'),
      dataIndex: 'email',
      isHideable: true,
    },
    {
      title: t('Phone Number'),
      dataIndex: 'phone',
      isHideable: true,
    },
    {
      title: t('Create Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
      isHideable: true,
    },
  ];

  async function getData(params) {
    await userStore.fetchList({ role: id, ...params });
  }

  const currentProps = {
    columns,
    store: userStore,
    module: 'role',
    name: t('role'),
    actionConfigs,
    isAction: false,
    searchFilters: [
      {
        label: t('Users'),
        name: 'users',
      },
    ],
    getData,
  };

  return <BaseList {...currentProps} />;
}
