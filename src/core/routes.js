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
/* eslint-disable import/no-unresolved */
import BlankLayout from 'layouts/Blank';
import SubContent from 'layouts/Blank/microContent';
import E404 from 'components/E404';
import { lazy } from 'react';
import { homePageRoute } from 'utils';

const Oauth = lazy(() =>
  import(/* webpackChunkName: "oauth" */ 'oauth/App.jsx')
);
const Oauth2 = lazy(() =>
  import(/* webpackChunkName: "oauth" */ 'oauth2/App.jsx')
);
const Cluster = lazy(() =>
  import(/* webpackChunkName: "Cluster" */ 'cluster/App.jsx')
);
const Node = lazy(() => import(/* webpackChunkName: "Node" */ 'node/App.jsx'));
const Access = lazy(() =>
  import(/* webpackChunkName: "access" */ 'access/App.jsx')
);
const Region = lazy(() =>
  import(/* webpackChunkName: "Region" */ 'region/App.jsx')
);
const Audit = lazy(() =>
  import(/* webpackChunkName: "Terminal" */ 'audit/App.jsx')
);

const defaultPath = homePageRoute() || 'auth/login';

export default [
  {
    component: BlankLayout,
    routes: [
      {
        path: '/',
        redirect: { from: '/', to: defaultPath, exact: true },
      },
      {
        path: '/cluster',
        component: Cluster,
      },
      {
        path: '/region',
        component: Region,
      },
      {
        path: '/node',
        component: Node,
      },
      {
        path: '/audit',
        component: Audit,
      },
      {
        path: '/access',
        component: Access,
      },
      {
        path: '/auth',
        component: Oauth,
      },
      {
        path: '/oauth2',
        component: Oauth2,
      },
      {
        path: '/kube',
        component: SubContent,
      },
      {
        path: '*',
        component: E404,
      },
    ],
  },
];
