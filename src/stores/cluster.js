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
import { getLocalStorageItem } from 'utils/localStorage';

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

  async detailDidFetch(detail) {
    const nodeList = await this.rootStore.nodeStore.fetchListResult();

    this.nodes = nodeList;

    return {
      ...detail,
      nodes: nodeList,
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

  async fetchComponents(params) {
    let lang = getLocalStorageItem('lang') || 'zh';
    if (lang === 'zh-cn') {
      lang = 'zh';
    }
    const result = await request.get(
      `${APIVERSION.config}/components?lang=${lang}`,
      params
    );
    const data = result;
    this.components = data || [];
    return data;
  }

  /**
   * 添加/删除组件
   * @param {Array} components 组件列表
   * @param {Boolean} uninstall 卸载 true，安装 false
   */
  async patchComponents(id, components, uninstall) {
    const result = await request.patch(this.patchComponentsUrl(id), {
      components,
      uninstall,
    });

    const detail = this.mapper(get(result, this.responseKey) || result);
    this.detail = detail;
  }

  async fetchVersion(params) {
    this.fetchOnlineVersion(params);
    this.fetchOfflineVersion(params);
  }

  async fetchOnlineVersion(params) {
    const onlineResult = await request.get(
      `${APIVERSION.config}/componentmeta`,
      {
        ...params,
        online: true,
      }
    );
    const onlineData = get(onlineResult, 'items') || [];
    this.onlineVersion = onlineData || [];
  }

  async fetchOfflineVersion(params) {
    const offlineResult = await request.get(
      `${APIVERSION.config}/componentmeta`,
      {
        ...params,
        online: false,
      }
    );
    const offlineData = get(offlineResult, 'items') || [];
    this.offlineVersion = offlineData || [];
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
