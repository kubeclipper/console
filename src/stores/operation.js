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

class OperationStore extends BaseStore {
  operations = [];

  currentOperation = {};

  operationSteps = [];

  currentNodesByStep = {};

  activeStepIndex = 0;

  module = 'operations';

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

  retry(params, data) {
    return this.submitting(
      request.post(`${this.getDetailUrl(params)}/retry`, data)
    );
  }

  stop(params) {
    return this.submitting(
      request.post(`${this.getDetailUrl(params)}/termination`)
    );
  }

  reset() {
    this.currentOperation = {};
    this.operationSteps = [];
    this.currentNodesByStep = {};
  }
}

export default OperationStore;
