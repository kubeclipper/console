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
import { APIVERSION } from 'utils/constants';
import ObjectMapper from 'utils/object.mapper';

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
    this.rawOperation = null;
    this.taskTimer = null;
    this.refreshing = false;
    this.disposer = null;
    this.manuallySelectedStepID = null;
  }

  componentDidMount() {
    this.store.list.silent = true;
    this.loadOperation();
    this.initWebsocket();
    this.taskTimer = setInterval(this.refreshTasks, 2000);
  }

  componentWillUnmount() {
    this.store.list.silent = false;
    this.websocket.close();
    this.disposer?.();
    if (this.taskTimer) {
      clearInterval(this.taskTimer);
      this.taskTimer = null;
    }
  }

  initWebsocket = () => {
    const token = getToken();
    this.websocket.watch(
      `api/operations.kubeclipper.io/v1alpha1/operations?fieldSelector=metadata.name=${encodeURIComponent(
        this.item.name
      )}&watch=true&token=${encodeURIComponent(token)}`
    );

    this.disposer = reaction(
      () => this.websocket.message,
      (message) => {
        message = toJS(message);
        const types = ['ADDED', 'MODIFIED', 'DELETED'];
        if (types.includes(message.type)) {
          this.updateOperation(message.object);
        }
      }
    );
  };

  loadOperation = async () => {
    try {
      const operation = await request.get(
        `${APIVERSION.operations}/operations/${encodeURIComponent(
          this.item.name
        )}`
      );
      await this.updateOperation(operation);
    } catch (error) {
      // The operation list already rendered the row. Keep the dialog usable
      // while the watch connection retries after a transient read failure.
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  refreshTasks = async () => {
    if (!this.rawOperation || this.refreshing) return;

    this.refreshing = true;
    try {
      const tasks = await this.fetchTasks(this.rawOperation);
      await this.updateOperation(this.rawOperation, tasks);
    } catch (error) {
      // Task creation/status updates are eventually consistent with the
      // operation watch. The next refresh will retry without closing the log.
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      this.refreshing = false;
    }
  };

  fetchTasks = async (operation) => {
    const uid = operation?.metadata?.uid;
    if (!uid) return [];

    const result = await request.get(
      `${APIVERSION.operations}/operationtasks`,
      { fieldSelector: `spec.operationRef.uid=${uid}` }
    );
    return result?.items || [];
  };

  updateOperation = async (operation, tasks) => {
    if (!operation) return;

    if (
      this.rawOperation?.metadata?.uid &&
      this.rawOperation.metadata.uid !== operation.metadata?.uid
    ) {
      this.manuallySelectedStepID = null;
    }
    this.rawOperation = operation;
    const operationTasks = tasks || (await this.fetchTasks(operation));
    const result = ObjectMapper.operations(operation, operationTasks);
    const { operationSteps } = result;

    this.store.status = result.status;
    this.store.currentOperation = result;
    this.store.operationSteps = operationSteps;

    let index = this.manuallySelectedStepID
      ? operationSteps.findIndex(
          (step) => step.stepID === this.manuallySelectedStepID
        )
      : -1;

    if (index === -1) {
      const activeIndex = operationSteps.findIndex((step) => !step.isComplete);
      index = activeIndex === -1 ? operationSteps.length - 1 : activeIndex;
      if (this.manuallySelectedStepID) {
        this.manuallySelectedStepID = null;
      }
    }

    if (index >= 0) {
      this.activeByStep(operationSteps[index], index);
    }
  };

  activeByStep = async (step, index, manuallySelected = false) => {
    if (!step) return;

    if (manuallySelected) {
      this.manuallySelectedStepID = step.stepID;
    }
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
