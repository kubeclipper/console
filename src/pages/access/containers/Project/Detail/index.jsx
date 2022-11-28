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
import { useRootStore } from 'stores';
import actionConfigs from '../actions';
import ProjectRole from './ProjectRole';
import ProjectUser from './ProjectUser';

export default function RoleDetail(props) {
  const { projectStore } = useRootStore();
  const currentProps = {
    ...props,
    name: t('projects'),
    listUrl: '/access/projects',
    store: projectStore,
    actionConfigs,
    detailInfos: [
      {
        title: t('Project Name'),
        dataIndex: 'name',
      },
      {
        title: t('Cluster Count'),
        dataIndex: 'clusterCount',
      },
      {
        title: t('Node Count'),
        dataIndex: 'nodeCount',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Create Time'),
        dataIndex: 'createTime',
        valueRender: 'toLocalTime',
      },
    ],
    tabs: [
      {
        title: t('Project User'),
        key: 'projectUser',
        component: ProjectUser,
      },
      {
        title: t('Project Role'),
        key: 'projectRole',
        component: ProjectRole,
      },
    ],
  };

  return <BaseTabDetail {...currentProps} />;
}
