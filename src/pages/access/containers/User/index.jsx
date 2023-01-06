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

const User = () => {
  const { userStore } = useRootStore();

  const columns = [
    {
      title: t('User Name'),
      dataIndex: 'name',
      extraNameIndex: 'displayName',
      render: (name, record) => {
        if (name) {
          return <Link to={`/access/user/${record.id}`}>{name}</Link>;
        }
        return '-';
      },
    },
    // {
    //   title: t('Status'),
    //   dataIndex: 'status',
    //   render: (value) => userStatus[value] || '-',
    // },
    {
      title: t('Role'),
      dataIndex: 'role',
      render: (value) => value && value,
    },
    {
      title: t('Email'),
      dataIndex: 'email',
      isHideable: true,
    },
    {
      title: t('Phone'),
      dataIndex: 'phone',
      isHideable: true,
    },
    {
      title: t('Authentication Mode'),
      dataIndex: 'authenticationMode',
      isHideable: true,
      render: (data) => <div style={{ minWidth: '50px' }}>{data}</div>,
    },
    {
      title: t('Create Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
    },
  ];

  const currentProps = {
    name: t('users'),
    searchFilters: [
      {
        label: t('User Name'),
        name: 'name',
      },
    ],
    columns,
    actionConfigs,
    store: userStore,
  };

  return <BaseList {...currentProps} />;
};

export default User;
