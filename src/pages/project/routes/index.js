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
import User from '../containers/User';
import Role from '../containers/Role';
import ProjectRoleCreate from 'pages/access/containers/Project/Detail/ProjectRole/actions/Create';
import ProjectRoleDetail from '../containers/Role/Detail';
import EmptyProject from 'components/EmptyProject';

import E404 from 'components/E404';

const PATH = '/project';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/user`, component: User, exact: true },
      { path: `${PATH}/role`, component: Role, exact: true },
      {
        path: `${PATH}/role/create`,
        component: ProjectRoleCreate,
        exact: true,
      },
      { path: `${PATH}/role/:id`, component: ProjectRoleDetail, exact: true },
      { path: `${PATH}/empty`, component: EmptyProject, exact: true },
      { path: '*', component: E404 },
    ],
  },
];
