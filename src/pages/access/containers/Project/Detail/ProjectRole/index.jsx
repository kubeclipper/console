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
import { useParams } from 'react-router-dom';
import BaseList from 'containers/List';
import actionConfigs from './actions';
import { useRootStore } from 'stores';

import { projectRoleColumns } from 'resources/project';

export default function Role(props) {
  const { projectRoleStore } = useRootStore();
  const { id } = useParams();

  const currentProps = {
    ...props,
    name: t('roles'),
    store: projectRoleStore,
    actionConfigs,
    searchFilters: [
      {
        label: t('Role Name'),
        name: 'name',
      },
    ],
    columns: projectRoleColumns({ isAdminPage: true }),
    propsParams: {
      labelSelector: '!kubeclipper.io/role-template',
      project: id,
    },
    detail: props.store.detail,
  };

  return <BaseList {...currentProps} />;
}
