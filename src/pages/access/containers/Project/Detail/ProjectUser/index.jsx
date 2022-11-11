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
import { useRootStore } from 'stores';
import { projectMemberColumns } from 'resources/project';
import actionConfigs from './actions';

const User = (props) => {
  const { projectUserStore } = useRootStore();
  const { id } = useParams();

  const currentProps = {
    name: t('users'),
    searchFilters: [
      {
        label: t('User Name'),
        name: 'name',
      },
    ],
    columns: projectMemberColumns,
    actionConfigs,
    store: projectUserStore,
    propsParams: {
      project: id,
    },
    detail: props.store.detail,
  };

  return <BaseList {...currentProps} />;
};

export default User;
