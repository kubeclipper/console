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
import React, { useEffect, useState } from 'react';
import { useRootStore } from 'stores';
import Tab from 'containers/Tab';
import ClusterTemplate from './cluster';
import PluginTemplate from './plugin';
import { filterComponents } from 'utils/schemaForm';

const TemplateManagement = () => {
  const { templatesStore, clusterStore } = useRootStore();
  const [components, setcomponents] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function init() {
      let _components = await clusterStore.fetchComponents();
      _components = filterComponents(_components);
      setcomponents(_components);
      setLoading(true);
    }
    init();
  }, []);

  const PluginComponents = components.map((item) => ({
    title: `${item?.name} ${t('Template')}`,
    key: item?.name,
    component: PluginTemplate,
    isNeedDetail: false,
    currentComponent: item,
  }));

  const currentProps = {
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

  return loading && <Tab {...currentProps} />;
};

export default TemplateManagement;
