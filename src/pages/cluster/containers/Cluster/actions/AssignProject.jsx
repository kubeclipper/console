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
import { observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { merge } from 'lodash';
import { rootStore } from 'stores';

@observer
class AssignProject extends ModalAction {
  init() {
    this.store = rootStore.clusterStore;
    this.projectStore = rootStore.projectStore;

    this.getProject();
  }

  static id = 'cluster-edit';

  static buttonText = t('Assign Project');

  static title = t('Assign Project');

  static policy = 'clusters:edit';

  static isRunning = (item) => item.status === 'Running';

  static isAssigned = (item) => item.project;

  static allowed = (item) =>
    Promise.resolve(this.isRunning(item) && !this.isAssigned(item));

  get projectList() {
    return this.projectStore.list.data || [];
  }

  get projectOptions() {
    const options = this.projectList.map((item) => ({
      value: item.name,
      label: item.name,
    }));
    return options;
  }

  getProject() {
    this.projectStore.fetchList();
  }

  get tips() {
    return t(
      'After the cluster is assigned a project, it is not allowed to change the project to which the cluster belongs. Please operate carefully.'
    );
  }

  get formItems() {
    return [
      {
        name: 'project',
        label: t('Project'),
        type: 'select',
        options: this.projectOptions,
        required: true,
      },
    ];
  }

  onSubmit = ({ project }) => {
    const { name, resourceVersion } = this.item;

    const label = {
      metadata: {
        labels: {
          'kubeclipper.io/project': project,
        },
      },
    };

    const formTemplate = merge(this.item._originData, label);

    return this.store.edit({ id: name, resourceVersion }, formTemplate);
  };
}

export default AssignProject;
