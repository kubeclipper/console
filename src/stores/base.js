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

import { get, set } from 'lodash';
import { action, makeObservable, observable } from 'mobx';
import ObjectMapper from 'utils/object.mapper';
import { APIVERSION } from 'utils/constants';

import List from './base.list';

export default class BaseStore {
  list = new List();

  detail = {};

  isLoading = true;

  isSubmitting = false;

  constructor(rootStore) {
    this.rootStore = rootStore;

    makeObservable(this, {
      list: observable,
      detail: observable,
      isLoading: observable,
      isSubmitting: observable,
      fetchList: action,
      fetchDetail: action,
      create: action,
      edit: action,
      patch: action,
      delete: action,
    });
  }

  module = '';

  get responseKey() {
    return 'items';
  }

  get mapper() {
    return ObjectMapper[this.module] || ((data) => data);
  }

  get paramsFunc() {
    return (params) => params;
  }

  get pageParamsFunc() {
    return (params) => {
      if (params.limit === -1) {
        params.limit = -1;
        params.page = 1;
      }

      params.limit = params.limit || 10;

      return params;
    };
  }

  get apiType() {
    return 'core';
  }

  get apiVersion() {
    return APIVERSION[this.apiType] || 'api/core.kubeclipper.io/v1';
  }

  getListUrl = () => `${this.apiVersion}/${this.module}`;

  getDetailUrl = ({ id }) => `${this.getListUrl()}/${id}`;

  setSelectRowKeys(key, selectedRowKeys) {
    this[key] && this[key].selectedRowKeys.replace(selectedRowKeys);
  }

  submitting = (promise) => {
    this.isSubmitting = true;

    setTimeout(() => {
      promise
        .catch(() => {})
        .finally(() => {
          this.isSubmitting = false;
        });
    }, 500);

    return promise;
  };

  // eslint-disable-next-line no-unused-vars
  async listDidFetch(items, filters = {}) {
    return items;
  }

  getListDataFromResult = (result) =>
    this.responseKey ? get(result, this.responseKey, []) || [] : result;

  getListData = (result, mapper) =>
    this.getListDataFromResult(result)?.map(mapper || this.mapper) ?? null;

  async fetchList({ more, ...params } = {}) {
    !this.list.silent && this.list.reset();

    const newParams = this.paramsFunc(this.pageParamsFunc(params));
    const result = (await request.get(`${this.getListUrl()}`, newParams)) || [];
    const data = this.getListData(result);

    let newData = [];
    try {
      newData = await this.listDidFetch(data, newParams);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }

    this.updateList(more, params, newData, result);
    return newData;
  }

  async fetchListAll() {
    return this.fetchList({ limit: -1 });
  }

  updateList(more, params, data, result) {
    this.list.update({
      data: more ? [...this.list.data, ...data] : data,
      total: result.totalCount || 0,
      limit: Number(params.limit) || 10,
      page: Number(params.page) || 1,
      ...params,
      isLoading: false,
      ...(this.list.silent ? {} : { selectedRowKeys: [] }),
    });
  }

  getDetailParams = () => undefined;

  async detailDidFetch(detail) {
    return detail;
  }

  async fetchDetail({ id }, silent) {
    if (!silent) {
      this.isLoading = true;
    }
    const result = await request.get(this.getDetailUrl({ id }));
    const detail = get(result, this.responseKey) || result;

    let data;
    let newDetail = null;
    try {
      data = await this.detailDidFetch(detail, { id });
      newDetail = this.mapper(data);
    } catch (e) {
      newDetail = this.mapper(detail);
      // eslint-disable-next-line no-console
      console.log(e);
    }

    this.detail = newDetail;
    this.isLoading = false;

    return newDetail;
  }

  create(data, params = {}) {
    return this.submitting(request.post(this.getListUrl(params), data));
  }

  edit(params, newObject) {
    const resourceVersion = get(params, 'resourceVersion');
    if (resourceVersion) {
      set(newObject, 'metadata.resourceVersion', resourceVersion);
    }
    return this.submitting(request.put(this.getDetailUrl(params), newObject));
  }

  patch(params, newObject) {
    return this.submitting(request.patch(this.getDetailUrl(params), newObject));
  }

  delete(params) {
    return this.submitting(request.delete(this.getDetailUrl(params)));
  }

  batchDelete(rowKeys) {
    return this.submitting(
      Promise.all(
        rowKeys.map((name) => {
          const item = this.list.data.find((_item) => _item.name === name);
          return request.delete(this.getDetailUrl(item));
        })
      )
    );
  }

  checkName(params) {
    return request.head(this.getListUrl(), params);
  }

  clearData() {
    this.list.reset();
    this.detail = {};
  }
}
