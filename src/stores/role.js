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

import { get } from 'lodash';
import List from './base.list';

import BaseStore from './base';

export default class RoleStore extends BaseStore {
  roleTemplates = new List();

  module = 'roles';

  get apiType() {
    return 'iam';
  }

  get paramsFunc() {
    return (params) => {
      // 过滤掉 anonymous, authenticated
      params.labelSelector = params.labelSelector
        ? `${params.labelSelector},!kubeclipper.io/hidden`
        : params.labelSelector;
      return params;
    };
  }

  async fetchRoleTemplates(params) {
    this.roleTemplates.isLoading = true;

    const newParams = this.pageParamsFunc(params);
    newParams.labelSelector = 'kubeclipper.io/role-template=true';

    const result = await request.get(`${this.getListUrl()}`, newParams);

    this.roleTemplates.update({
      data: get(result, 'items', []).map(this.mapper),
      total: result.totalItems || result.total_count || 0,
      isLoading: false,
    });
  }
}
