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
import { useRootStore } from 'stores';

import BaseList from 'containers/List';
import actionConfigs from './actions';

const ClusterTemplate = (props) => {
  const { templatesStore: store } = useRootStore();

  const columns = [
    {
      title: t('Name'),
      dataIndex: 'templateName',
      width: '20%',
    },
    {
      title: t('Description'),
      dataIndex: 'templateDescription',
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
    name: t('Cluster'),
    columns,
    searchFilters: [
      {
        label: t('Name'),
        name: 'name',
      },
    ],
    actionConfigs,
    store,
    isRenderFooter: false,
    isShowDownLoadIcon: false,
    isShowEyeIcon: false,
    getData,
  };

  async function getData(params) {
    const { name, category } = props.currentTab.currentComponent;

    const labelSelector = `kubeclipper.io/componentName=${name},kubeclipper.io/category=${category}`;
    await store.fetchList({ labelSelector, ...params });
  }

  return <BaseList {...currentProps} />;
};

export default ClusterTemplate;
