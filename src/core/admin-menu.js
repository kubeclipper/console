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
import {
  GlobalOutlined,
  UserOutlined,
  NodeCollapseOutlined,
  ClusterOutlined,
} from '@ant-design/icons';

const renderAdminMenu = (t) => {
  if (!t) {
    return [];
  }
  const menu = [
    {
      name: t('Cluster Management'),
      key: 'cluster-management',
      icon: <ClusterOutlined />,
      children: [
        {
          path: '/cluster-admin',
          name: t('Cluster'),
          key: 'cluster',
          level: 1,
          module: 'clusters',
          children: [
            {
              path: '/cluster-admin/create',
              name: t('Create Cluster'),
              key: 'cluster-create',
              level: 2,
              module: 'clusters',
            },
            {
              path: /^\/cluster-admin\/.[^/]+$/,
              name: t('Cluster Detail'),
              key: 'cluster-detail',
              level: 2,
              module: 'clusters',
            },
            {
              path: /^\/cluster-admin\/add-storage\/.[^/]+$/,
              name: t('Add Storage'),
              key: 'add-storage',
              level: 2,
              module: 'clusters',
            },
            {
              path: /^\/cluster-admin\/add-plugin\/.[^/]+$/,
              name: t('Add Plugin'),
              key: 'add-plugin',
              level: 2,
              module: 'clusters',
            },
          ],
        },
        {
          path: '/cluster/backup-point-admin',
          name: t('BackupPoint'),
          key: 'backup-point',
          level: 1,
          module: 'backuppoints',
        },
        {
          path: '/cluster/template-admin',
          name: t('Template Management'),
          key: 'template-management',
          level: 1,
          module: 'clusters',
          children: [
            {
              path: '/cluster/template-admin/create',
              name: t('Create Template'),
              key: 'cluster-template-create',
              level: 2,
              module: 'clusters',
            },
            {
              path: /^\/cluster\/template-admin\/edit\/.[^/]+$/,
              name: t('Edit Template'),
              key: 'cluster-template-edit',
              level: 2,
              module: 'clusters',
            },
            {
              path: /^\/cluster\/plugin-template-admin\/create\/.[^/]+$/,
              name: t('Create Plugin Template'),
              key: 'plugin-template-create',
              level: 2,
              module: 'clusters',
            },
            {
              path: /^\/cluster\/plugin-template-admin\/edit\/.[^/]+\/.[^/]+$/,
              name: t('Edit Plugin Template'),
              key: 'plugin-template-edit',
              level: 2,
              module: 'clusters',
            },
          ],
        },
        {
          path: '/cluster/registry-admin',
          name: t('Registry'),
          key: '/cluster/registry',
          level: 1,
          module: 'registries',
        },
        {
          path: '/cluster/hosting-admin',
          name: t('Cluster Hosting'),
          key: 'cloud-hosting',
          level: 1,
          module: 'cloudproviders',
          children: [
            {
              path: /^\/cluster\/hosting-admin\/.[^/]+$/,
              name: t('Cluster Hosting Detail'),
              key: 'cluster-Hosting-detail',
              level: 2,
              module: 'cloudproviders',
            },
          ],
        },
      ],
    },
    {
      path: '/region-admin',
      name: t('Region Management'),
      key: '/region',
      icon: <GlobalOutlined />,
      level: 1,
      children: [
        {
          path: /^\/region-admin\/.[^/]+$/,
          name: t('Region Detail'),
          key: 'region-detail',
          level: 2,
          module: 'clusters',
        },
      ],
    },
    {
      path: '/node-admin',
      name: t('Node Info'),
      key: '/node',
      icon: <NodeCollapseOutlined />,
      level: 1,
      children: [
        {
          path: /^\/node-admin\/.[^/]+$/,
          name: t('Node Detail'),
          key: 'node-detail',
          level: 2,
          module: 'clusters',
        },
      ],
    },
    {
      path: '/access',
      name: t('Access Control'),
      key: '/access',
      icon: <UserOutlined />,
      children: [
        {
          path: '/access/user-admin',
          name: t('Platform Users'),
          key: '/access/user',
          level: 1,
          module: 'users',
          children: [
            {
              path: /^\/access\/user-admin\/.[^/]+$/,
              name: t('User Detail'),
              key: 'user-detail',
              level: 2,
              module: 'users',
            },
          ],
        },
        {
          path: '/access/role-admin',
          name: t('Platform Roles'),
          key: '/access/role',
          level: 1,
          module: 'roles',
          children: [
            {
              path: /^\/access\/role-admin\/[^/]+$/,
              name: t('Role Detail'),
              key: 'role-detail',
              level: 2,
              module: 'roles',
            },
            {
              path: '/access/role-admin/create',
              name: t('Create Role'),
              key: 'role-create',
              level: 2,
              module: 'roles',
            },
          ],
        },
        {
          path: '/access/projects-admin',
          name: t('Project'),
          key: '/access/projects',
          level: 1,
          module: 'projects',
          children: [
            {
              path: /^\/access\/projects-admin\/.[^/]+$/,
              name: t('Project Detail'),
              key: 'project-detail',
              level: 2,
              module: 'projects',
            },
            {
              path: /^\/access\/projects-admin\/role-create\/.[^/]+$/,
              name: t('Project Role'),
              key: 'project-role',
              level: 2,
              module: 'projects',
            },
          ],
        },
      ],
    },
  ];
  return menu;
};

export default renderAdminMenu;
