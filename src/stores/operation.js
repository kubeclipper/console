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

  operationQueryKey = '';

  operationContinueTokens = {};

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
   * Operation V2 uses Kubernetes ListOptions. Keep the page-number UI while
   * translating it to the server-side limit/continue cursor API.
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
    const queryKey = JSON.stringify({ query, operationName, limit });
    if (page === 1 || queryKey !== this.operationQueryKey) {
      this.operationQueryKey = queryKey;
      this.operationContinueTokens = {};
    }

    // The operation-name search is a client-side contains filter. Fetching a
    // complete filtered result keeps that behavior until the API exposes a
    // matching field selector; normal browsing remains cursor-paginated.
    const paged = !operationName && limit > 0;
    const requestQuery = { ...query };
    if (paged) {
      requestQuery.limit = limit;
    }

    let result = {};
    let data = [];
    if (paged) {
      let currentPage = 1;
      let continueToken = '';
      while (
        currentPage < page &&
        this.operationContinueTokens[currentPage]
      ) {
        continueToken = this.operationContinueTokens[currentPage];
        currentPage += 1;
      }
      while (currentPage <= page) {
        const pageQuery = {
          ...requestQuery,
          ...(continueToken ? { continue: continueToken } : {}),
        };
        // Cursor pages must be fetched in order because each token is issued
        // by the preceding response.
        // eslint-disable-next-line no-await-in-loop
        result = (await request.get(this.getListUrl(), pageQuery)) || {};
        data = this.getListData(result);
        this.operationContinueTokens[currentPage] = get(
          result,
          'metadata.continue',
          ''
        );
        continueToken = this.operationContinueTokens[currentPage];
        if (currentPage < page && !continueToken) {
          data = [];
          break;
        }
        currentPage += 1;
      }
    } else {
      result = (await request.get(this.getListUrl(), requestQuery)) || {};
      data = this.getListData(result).filter(
        (item) =>
          !operationName ||
          String(item.operationName || '').includes(String(operationName))
      );
    }

    const newData = await this.listDidFetch(data, query);
    const remaining = get(result, 'metadata.remainingItemCount');
    const pageOffset = (page - 1) * limit;
    const total = paged
      ? Number.isFinite(Number(remaining))
        ? pageOffset + data.length + Number(remaining)
        : pageOffset + data.length
      : data.length;

    this.list.update({
      data: more ? [...this.list.data, ...newData] : newData,
      total,
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
