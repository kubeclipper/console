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

import BaseStore from './base';

export default class CronBackUpStore extends BaseStore {
  module = 'cronBackups';

  getListUrl = () => `${this.apiVersion}/cronbackups`;

  async listDidFetch(items, filters = {}) {
    const { id } = filters;
    return items.filter((item) => item.clusterName === id);
  }

  async disable({ id }) {
    return this.submitting(
      request.patch(`${this.getDetailUrl({ id })}/disable`)
    );
  }

  async enable({ id }) {
    return this.submitting(
      request.patch(`${this.getDetailUrl({ id })}/enable`)
    );
  }
}
