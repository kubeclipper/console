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
import { APIVERSION } from 'utils/constants';

export default class LogStore extends BaseStore {
  logdata = '';

  isExpand = false;

  cumulativeSize = 0;

  isStepFinished = false;

  fetchPromise = null;

  generation = 0;

  error = '';

  constructor(props) {
    super(props);
    makeObservable(this, {
      isExpand: observable,
      logdata: observable,
      error: observable,
    });
  }

  async fetchStepLog(params) {
    const { generation } = this;
    while (this.fetchPromise) {
      // Serialize reads because each request depends on the preceding byte offset.
      // eslint-disable-next-line no-await-in-loop
      await this.fetchPromise;
      if (generation !== this.generation) return;
    }
    if (!params.taskName) return;

    this.isLoading = true;
    const pending = this.fetchStepLogContent(params, generation).catch(
      (error) => {
        if (generation === this.generation) {
          this.error =
            error?.reason || error?.message || t('Failed to load task logs');
        }
      }
    );
    this.fetchPromise = pending;
    try {
      await pending;
    } finally {
      if (this.fetchPromise === pending) this.fetchPromise = null;
      if (generation === this.generation) this.isLoading = false;
    }
  }

  async fetchStepLogContent(params, generation) {
    let more;
    do {
      // Terminal logs must be drained in byte-offset order.
      // eslint-disable-next-line no-await-in-loop
      const res = await request.get(
        `${APIVERSION.operations}/operationtasks/${encodeURIComponent(
          params.taskName
        )}/logs`,
        { offset: this.cumulativeSize, limit: 64 * 1024 }
      );
      if (generation !== this.generation) return;

      const deliverySize = res.deliverySize || 0;
      this.cumulativeSize += deliverySize;
      this.logdata += res.content || '';
      this.error = '';
      more =
        this.isStepFinished &&
        deliverySize > 0 &&
        this.cumulativeSize < res.logSize;
    } while (more);
  }

  async getStepLog(params) {
    await this.fetchStepLog(params);
  }

  logReset() {
    this.generation += 1;
    this.cumulativeSize = 0;
    this.logdata = '';
    this.error = '';
    this.isLoading = false;
  }
}
