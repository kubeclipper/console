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

import { APIVERSION } from 'utils/constants';
import BaseStore from './base';

export default class NodeStore extends BaseStore {
  module = 'nodes';

  async fetchListResult(params) {
    const result = (await request.get(`${this.getListUrl()}`, params)) || [];
    return result;
  }

  async fetchTerminalKey() {
    const terminalKeyUrl = `${APIVERSION.config}/terminal.key`;
    const result = await request.get(terminalKeyUrl);
    return result;
  }

  async disable(name) {
    return this.submitting(
      request.patch(`${this.getDetailUrl({ id: name })}/disable`)
    );
  }

  async enable(name) {
    return this.submitting(
      request.patch(`${this.getDetailUrl({ id: name })}/enable`)
    );
  }

  async assignProject(id, data) {
    return this.submitting(
      request.put(`${this.getDetailUrl({ id })}/join`, data)
    );
  }
}
