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
import { APIVERSION } from 'utils/constants';
import ObjectMapper from 'utils/object.mapper';

import BaseStore from './base';

export default class ClusterStore extends BaseStore {
  nodes = [];

  components = [];

  onlineVersion = [];

  offlineVersion = [];

  scNames = [];

  module = 'clusters';

  patchComponentsUrl = (cluster) =>
    `${this.apiVersion}/clusters/${cluster}/plugins`;

  get nodeMapper() {
    return ObjectMapper.nodes || ((data) => data);
  }

  async detailDidFetch(detail) {
    const result = await this.rootStore.nodeStore.fetchListResult();
    const data = this.getListData(result, this.nodeMapper);
    this.nodes = data;

    return {
      ...detail,
      nodes: data,
    };
  }

  async updateDetail({ id }) {
    const result = await request.get(this.getDetailUrl({ id }));
    const detail = this.mapper(get(result, this.responseKey) || result);
    this.detail = detail;
    return detail;
  }

  async addOrRemoveNode(id, params) {
    const res = await request.put(`${this.getDetailUrl({ id })}/nodes`, params);
    return res;
  }

  /**
   * 添加/删除组件
   * @param {Array} components 组件列表
   * @param {Boolean} uninstall 卸载 true，安装 false
   */
  async patchComponents(id, addons, uninstall) {
    const result = await request.patch(this.patchComponentsUrl(id), {
      addons,
      uninstall,
    });

    const detail = this.mapper(get(result, this.responseKey) || result);
    this.detail = detail;
  }

  async fetchVersion(params) {
    await this.fetchOnlineVersion(params);
    await this.fetchOfflineVersion(params);
  }

  async fetchOnlineVersion(params) {
    try {
      const onlineResult = await request.get(
        `${APIVERSION.config}/componentmeta`,
        {
          ...params,
          online: true,
        }
      );
      const onlineData = get(onlineResult, 'rules') || [];
      this.onlineVersion = onlineData || [];
    } catch (e) {}
  }

  async fetchOfflineVersion(params) {
    try {
      const offlineResult = await request.get(
        `${APIVERSION.config}/componentmeta`,
        {
          ...params,
          online: false,
        }
      );
      const offlineData = get(offlineResult, 'rules') || [];
      this.offlineVersion = offlineData || [];
    } catch (e) {}
  }

  async upgrade(data, { cluster }) {
    const result = await request.post(
      `${this.getDetailUrl({ id: cluster })}/upgrade`,
      data
    );

    return result;
  }

  reset(params) {
    return this.submitting(
      request.patch(`${this.getDetailUrl(params)}/status`)
    );
  }
}
