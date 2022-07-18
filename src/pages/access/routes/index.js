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
import UserCreate from '../containers/User/actions/Create';
import UserDetail from '../containers/User/Detail';
import Role from '../containers/Role';
import RoleCreate from '../containers/Role/actions/Create';
import RoleDetail from '../containers/Role/Detail';
import E404 from 'components/E404';

const PATH = '/access';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}/user`, component: User, exact: true },
      { path: `${PATH}/user/create`, component: UserCreate, exact: true },
      { path: `${PATH}/user/:id`, component: UserDetail, exact: true },
      { path: `${PATH}/role`, component: Role, exact: true },
      { path: `${PATH}/role/create`, component: RoleCreate, exact: true },
      { path: `${PATH}/role/:id`, component: RoleDetail, exact: true },
      { path: '*', component: E404 },
    ],
  },
];
