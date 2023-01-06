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
import BaseLayout from 'layouts/Base';
import ClusterList from '../containers/Cluster';
import ClusterDetail from '../containers/Cluster/Detail';
import Create from '../containers/Cluster/actions/Create';
import AddPlugin from '../components/plugin/AddPlugin';
import AddStorage from '../components/plugin/AddStorage';
import BackupPoint from '../containers/BackupPoint';
import Registry from '../containers/Registry';

import Template from '../containers/Template';
import ClusterTemplate from '../containers/Template/cluster/actions/Create';
import PluginTemplate from '../containers/Template/plugin/actions/Create';

import HostingList from '../containers/Hosting';
import ProviderDetail from '../containers/Hosting/Detail';
import E404 from 'components/E404';

const PATH = '/cluster';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}`, component: ClusterList, exact: true },
      { path: `${PATH}/create`, component: Create, exact: true },
      { path: `${PATH}/backup-point`, component: BackupPoint, exact: true },
      { path: `${PATH}/add-storage/:id`, component: AddStorage, exact: true },
      { path: `${PATH}/add-plugin/:id`, component: AddPlugin, exact: true },
      { path: `${PATH}/template`, component: Template, exact: true },
      {
        path: `${PATH}/template/create`,
        component: ClusterTemplate,
        exact: true,
      },
      {
        path: `${PATH}/template/edit/:id`,
        component: ClusterTemplate,
        exact: true,
      },
      {
        path: `${PATH}/plugin-template/create/:plugin`,
        component: PluginTemplate,
        exact: true,
      },
      {
        path: `${PATH}/plugin-template/edit/:plugin/:name`,
        component: PluginTemplate,
        exact: true,
      },
      {
        path: `${PATH}/registry`,
        component: Registry,
        exact: true,
      },
      { path: `${PATH}/hosting`, component: HostingList, exact: true },
      { path: `${PATH}/hosting/:id`, component: ProviderDetail, exact: true },
      { path: `${PATH}/hosting`, component: HostingList, exact: true },
      { path: `${PATH}/hosting/:id`, component: ProviderDetail, exact: true },
      { path: `${PATH}/:id`, component: ClusterDetail, exact: true },
      { path: '*', component: E404 },
    ],
  },
];
