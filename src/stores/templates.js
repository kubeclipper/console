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

export default class TemplatesStore extends BaseStore {
  allTemplates = [];

  currentDetail = {};

  module = 'templates';

  async update(datas) {
    const data = {
      insecureRegistry: datas,
    };
    await request.put(`${this.getListUrl()}`, data);
  }

  create(params, config) {
    const {
      templateName,
      templateDescription,
      pluginName,
      pluginVersion,
      pluginCategory,
    } = params;
    const datas = {
      kind: 'Template',
      apiVersion: 'core.kubeclipper.io/v1',
      metadata: {
        annotations: {
          'kubeclipper.io/display-name': templateName,
          'kubeclipper.io/description': templateDescription,
        },
        labels: {
          'kubeclipper.io/componentName': pluginName,
          'kubeclipper.io/componentVersion': pluginVersion,
          'kubeclipper.io/category': pluginCategory,
        },
      },
      config,
    };
    return this.submitting(request.post(this.getListUrl(), datas));
  }

  async query(params) {
    const templates = await request.get(this.getListUrl(), params);
    const [template = {}] = templates.items;

    return ObjectMapper[this.module](template);
  }

  patch(params, datas) {
    return this.submitting(request.put(this.getDetailUrl(params), datas));
  }
}
