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
import actionConfigs from './actions';
import { useRootStore } from 'stores';
import { INTERNAL_ROLE_DES } from 'utils/constants';

export default function Role(props) {
  const { roleStore } = useRootStore();

  const columns = [
    {
      title: t('Role Name'),
      dataIndex: 'name',
      render: (name, record) => {
        if (name) {
          return <Link to={`/access/role/${record.id}`}>{name}</Link>;
        }
        return '-';
      },
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      render: (value, record) => {
        const isInternal = Object.keys(INTERNAL_ROLE_DES).includes(record.name);

        if (isInternal) {
          return t(INTERNAL_ROLE_DES[record.name]);
        }

        return value;
      },
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
    name: t('roles'),
    store: roleStore,
    actionConfigs,
    searchFilters: [
      {
        label: t('Role Name'),
        name: 'name',
      },
    ],
    columns,
    propsParams: {
      labelSelector: '!kubeclipper.io/role-template',
    },
  };

  return <BaseList {...currentProps} />;
}
