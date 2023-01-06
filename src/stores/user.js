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

import ObjectMapper from 'utils/object.mapper';

import BaseStore from './base';

export default class UserStore extends BaseStore {
  module = 'users';

  get apiType() {
    return 'iam';
  }

  get loginLogMapper() {
    return ObjectMapper.loginLog || ((data) => data);
  }

  getloginLogUrl(id) {
    return `${this.getListUrl()}/${id}/loginrecords`;
  }

  async fetchLoginLogList({ more, name, params } = {}) {
    this.list.reset();
    const result =
      (await request.get(`${this.getloginLogUrl(name)}`, { ...params })) || [];

    const data = this.getListData(result, this.loginLogMapper);

    this.updateList(more, params, data, result);
    return result;
  }

  updatePassword(params, data) {
    return this.submitting(
      request.put(`${this.getDetailUrl(params)}/password`, data)
    );
  }
}
