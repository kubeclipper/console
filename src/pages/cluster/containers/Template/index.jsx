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
import Tab from 'containers/Tab';
import ClusterTemplate from './cluster';
import PluginTemplate from './plugin';
import { observer } from 'mobx-react';
import { useQuery } from 'hooks';

const TemplateManagement = () => {
  const { templatesStore, components, componentsLoading } = useRootStore();
  const query = useQuery();

  const PluginComponents = components.map((item) => ({
    title: `${item?.name} ${t('Template')}`,
    key: item?.name,
    component: PluginTemplate,
    isNeedDetail: false,
    currentComponent: item,
  }));

  const currentProps = {
    active: query.tab || 'cluster',
    store: templatesStore,
    tabs: [
      {
        title: `Cluster ${t('Template')}`,
        key: 'cluster',
        component: ClusterTemplate,
        isNeedDetail: false,
      },
      ...PluginComponents,
    ],
  };

  return componentsLoading && <Tab {...currentProps} />;
};

export default observer(TemplateManagement);
