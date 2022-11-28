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
import { ModalAction } from 'containers/Action';
import { observer } from 'mobx-react';
import { rootStore } from 'stores';

@observer
class AssignProject extends ModalAction {
  init() {
    this.store = rootStore.nodeStore;
    this.projectStore = rootStore.projectStore;

    this.getProject();
  }

  static id = 'cluster-edit';

  static buttonText = t('Assign Project');

  static title = t('Assign Project');

  static policy = 'clusters:edit';

  static isAssigned = (item) => item.project;

  get name() {
    return t('Assign project');
  }

  static allowed = (item) =>
    Promise.resolve(!this.isAssigned(item) && super.isAdminPage);

  get projectList() {
    return this.projectStore.list.data || [];
  }

  get instanceName() {
    return `${this.item.hostname}(${this.item.ip})`;
  }

  get isAsyncAction() {
    return true;
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
      'Only the node is assigned to the project, it can be used under the project'
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
    const { name } = this.item;

    const data = {
      op: 'add',
      project,
      node: name,
    };

    return this.store.assignProject(name, data);
  };
}

export default AssignProject;
