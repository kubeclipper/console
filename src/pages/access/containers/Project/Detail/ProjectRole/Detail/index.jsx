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
import BaseTabDetail from 'containers/TabDetail';
import BaseDetail from './BaseDetail';
import AuthorizedUsers from './AuthorizedUsers';
import { useRootStore } from 'stores';
import { INTERNAL_ROLE_DES } from 'utils/constants';
import actionConfigs from '../actions';

export default function RoleDetail(props) {
  const { roleStore } = useRootStore();
  const currentProps = {
    ...props,
    name: t('role'),
    listUrl: '/access/role',
    store: roleStore,
    actionConfigs,
    detailInfos: [
      {
        title: t('Role Name'),
        dataIndex: 'name',
      },
      {
        title: t('Create Time'),
        dataIndex: 'createTime',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        render: (value, record) => {
          const isInternal = Object.keys(INTERNAL_ROLE_DES).includes(
            record.name
          );

          if (isInternal) {
            return t(INTERNAL_ROLE_DES[record.name]);
          }

          return value;
        },
      },
    ],
    tabs: [
      {
        title: t('Authority List'),
        key: 'BaseDetail',
        component: BaseDetail,
      },
      {
        title: t('Authorized Users'),
        key: 'AuthorizedUsers',
        component: AuthorizedUsers,
      },
    ],
  };

  return <BaseTabDetail {...currentProps} />;
}
