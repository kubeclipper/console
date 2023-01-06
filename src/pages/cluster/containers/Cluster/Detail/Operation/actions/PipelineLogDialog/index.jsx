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

import React from 'react';
import { reaction, toJS } from 'mobx';
import { ViewAction } from 'containers/Action';
import { rootStore } from 'stores';
import WebsocketStore from 'stores/websocket';
import { getToken } from 'utils/localStorage';
import ObjectMapper from 'utils/object.mapper';
import { findLastIndex, findLast } from 'lodash';

import RightLogContent from './RightLogContent';
import LeftSteps from './LeftSteps';
import styles from './index.less';

export default class PipelineLog extends ViewAction {
  static id = 'viewlog';

  static title = t('ViewLog');

  static buttonText = t('ViewLog');

  static get modalSize() {
    return 'large';
  }

  static allowed() {
    return Promise.resolve(true);
  }

  constructor(props) {
    super(props);

    this.store = rootStore.operationStore;

    this.store.reset();
    this.websocket = new WebsocketStore();
  }

  componentDidMount() {
    this.store.list.silent = true;
    this.initWebsocket();
  }

  componentWillUnmount() {
    this.store.list.silent = false;
    this.websocket.close();
  }

  initWebsocket = () => {
    const token = getToken();
    this.websocket.watch(
      `api/core.kubeclipper.io/v1/operations?fieldSelector=metadata.name=${this.item.name}&watch=true&token=${token}`
    );

    this.disposer = reaction(
      () => this.websocket.message,
      (message) => {
        message = toJS(message);
        const types = ['ADDED', 'MODIFIED', 'DELETED'];
        if (types.includes(message.type)) {
          const result = ObjectMapper.operations(message.object);
          this.store.status = result.status;

          this.generateStatusBySteps(result.operationSteps);
          this.store.currentOperation = result;
          this.store.operationSteps = result.operationSteps;
        }
      }
    );
  };

  // 计算 step status
  generateStatusBySteps(operationSteps) {
    operationSteps.forEach((step, index) => {
      if (!step.status) {
        operationSteps[index].stepStatus = 'warning';
      } else {
        operationSteps[index].stepStatus = 'success';
        for (const node of step.status) {
          if (node.status === 'failed') {
            if (step.errignore) {
              operationSteps[index].stepStatus = 'warning';
            } else {
              operationSteps[index].stepStatus = 'failed';
            }
            break;
          }
        }
      }
    });

    const lastIndex = findLastIndex(operationSteps, (item) => item.stepID);
    const lastStep = findLast(operationSteps, (item) => item.stepID);

    const msgPending = ['running'];
    // const msgResolve = ['successful', 'failed'];

    if (
      lastIndex !== operationSteps.length - 1 &&
      msgPending.includes(this.store.status)
    ) {
      const processSteps = operationSteps[lastIndex + 1];
      processSteps.frontStatus = 'pending';
      processSteps.stepStatus = 'processing';

      this.activeByStep(processSteps, lastIndex + 1);
    } else {
      this.activeByStep(lastStep, lastIndex);
    }
  }

  activeByStep = async (step, index) => {
    this.store.currentNodesByStep = step;
    this.store.activeStepIndex = index;
  };

  renderContent = () => (
    <div className={styles.container}>
      <LeftSteps activeByStep={this.activeByStep} />
      <RightLogContent />
    </div>
  );
}
