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
import Login from '../containers/Login';
import UpdateLicense from '../containers/UpdateLicense';
import EmptyRole from '../containers/EmptyRole';

const PATH = '/auth';
export default [
  { path: `${PATH}/login`, component: Login, exact: true },
  { path: `${PATH}/update-license`, component: UpdateLicense, exact: true },
  { path: `${PATH}/empty-role`, component: EmptyRole, exact: true },
];
