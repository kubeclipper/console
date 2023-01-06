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
import Region from '../containers/Region';
import RegionDetail from '../containers/Region/Detail';

import E404 from 'components/E404';

const PATH = '/region';
export default [
  {
    path: PATH,
    component: BaseLayout,
    routes: [
      { path: `${PATH}`, component: Region, exact: true },
      { path: `${PATH}/:id`, component: RegionDetail, exact: true },
      { path: '*', component: E404 },
    ],
  },
];
