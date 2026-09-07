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
import { makeObservable, observable } from 'mobx';
import { get } from 'lodash';
import { APIVERSION } from 'utils/constants';

class OperationStore extends BaseStore {
  operations = [];

  currentOperation = {};

  operationSteps = [];

  currentNodesByStep = {};

  activeStepIndex = 0;

  module = 'operations';

  get apiType() {
    return 'operations';
  }

  get taskListUrl() {
    return `${APIVERSION.operations}/operationtasks`;
  }

  constructor(props) {
    super(props);

    makeObservable(this, {
      operations: observable,
      currentOperation: observable,
      operationSteps: observable,
      currentNodesByStep: observable,
      activeStepIndex: observable,
    });
  }

  async listDidFetch(items) {
    this.operations = items;
    return items;
  }

  async fetchTasks(operationUID) {
    const result = await request.get(this.taskListUrl, {
      fieldSelector: `spec.operationRef.uid=${operationUID}`,
    });
    return get(result, 'items', []);
  }

  control(params, action, data) {
    const operation =
      data || this.list.data.find((item) => item.id === params.id);
    const uid = get(operation, 'uid');
    const resourceVersion = get(operation, 'resourceVersion');

    if (!uid || !resourceVersion) {
      return Promise.reject(
        new Error('operation UID and resourceVersion are required')
      );
    }

    return this.submitting(
      request.post(`${this.getDetailUrl(params)}/${action}`, {
        uid,
        resourceVersion,
      })
    );
  }

  retry(params, data) {
    return this.control(params, 'retry', data);
  }

  stop(params, data) {
    return this.control(params, 'cancel', data);
  }

  /*
   * Operation V2 uses Kubernetes ListOptions. It supports limit/continue but
   * not the legacy page/reverse/totalCount parameters used by BaseStore.
   * Load the operation list once and paginate it locally for the existing UI.
   */
  async fetchList({ more, ...params } = {}) {
    !this.list.silent && this.list.reset();

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const query = { ...params };
    delete query.page;
    delete query.limit;
    delete query.reverse;
    delete query.silent;
    const operationName = query.operationName;
    delete query.operationName;
    const result = (await request.get(this.getListUrl(), query)) || {};
    const allData = this.getListData(result).filter(
      (item) =>
        !operationName ||
        String(item.operationName || '').includes(String(operationName))
    );
    const start = (page - 1) * limit;
    const data = limit > 0 ? allData.slice(start, start + limit) : allData;
    const newData = await this.listDidFetch(data, query);

    this.list.update({
      data: more ? [...this.list.data, ...newData] : newData,
      total: allData.length,
      limit,
      page,
      ...query,
      ...(operationName ? { operationName } : {}),
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });
    return newData;
  }

  reset() {
    this.currentOperation = {};
    this.operationSteps = [];
    this.currentNodesByStep = {};
  }
}

export default OperationStore;
