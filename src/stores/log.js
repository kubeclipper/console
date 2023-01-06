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

export default class LogStore extends BaseStore {
  logdata = '';

  isExpand = false;

  cumulativeSize = 0;

  isStepFinished = false;

  constructor(props) {
    super(props);

    makeObservable(this, {
      isExpand: observable,
      logdata: observable,
    });
  }

  async fetchStepLog(params) {
    const res = await request.get(`${this.apiVersion}/logs`, params);
    this.cumulativeSize += res.deliverySize || 0;
    this.logdata += res.content || '';

    if (this.isStepFinished && this.cumulativeSize < res.logSize) {
      params = { ...params, offset: this.cumulativeSize };
      this.fetchStepLog(params);
    }
    this.isExpand = true;
    this.isLoading = false;
  }

  async getStepLog(params) {
    this.isLoading = true;
    await this.fetchStepLog(params);
    this.isLoading = false;
  }

  logReset() {
    this.cumulativeSize = 0;
    this.logdata = '';
  }
}
