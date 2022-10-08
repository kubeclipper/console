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

export default class LicenseStore extends BaseStore {
  initializing = true;

  licenseInfo = {};

  versionInfo = {};

  module = 'license';

  get apiType() {
    return 'config';
  }

  getVersionnUrl = () => '/version';

  async getLicense(options = {}) {
    const result = await request.get(this.getListUrl(), null, {
      ...options,
    });
    this.licenseInfo = result || {};

    return result;
  }

  async getVersion() {
    const result = await request.get(
      this.getVersionnUrl(),
      {},
      {
        withoutToken: true,
      }
    );
    this.versionInfo = result || {};
  }

  async update({ body }) {
    await request.put(this.getListUrl(), body);
    await this.getLicense();
  }

  async withoutTokenUpdate({ body }) {
    await request.put(this.getListUrl(), body, { withoutToken: true });
  }
}
