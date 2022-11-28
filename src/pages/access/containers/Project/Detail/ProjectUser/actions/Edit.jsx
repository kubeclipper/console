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
import { set } from 'lodash';
import { observer } from 'mobx-react';
import { rootStore } from 'stores';

@observer
class Edit extends ModalAction {
  init() {
    this.projectUserStore = rootStore.projectUserStore;
    this.projectRoleStore = rootStore.projectRoleStore;

    this.getProjectRole();
  }

  static id = 'user-role-edit';

  static buttonText = t('Edit Role');

  static title = t('Edit Role');

  static policy = this.isAdminPage ? 'projects:edit' : 'projectmembers:edit';

  static allowed = () => Promise.resolve(true);

  get module() {
    return 'projectmembers';
  }

  async getProjectRole() {
    await this.projectRoleStore.fetchList({
      labelSelector: '!kubeclipper.io/role-template',
      limit: -1,
      project: this.project,
    });
  }

  get data() {
    return this.store.detail || [];
  }

  get defaultValue() {
    const { name, projectRole } = this.item;

    return {
      name,
      role: projectRole,
    };
  }

  get roles() {
    return (this.projectRoleStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.name,
    }));
  }

  get project() {
    return this.isAdminPage
      ? this.containerProps.detail.id
      : rootStore.currentProject;
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('User Name'),
        type: 'label',
      },
      {
        name: 'role',
        label: t('Role'),
        type: 'select',
        required: true,
        options: this.roles,
      },
    ];
  }

  onSubmit = (values) => {
    const formTemplate = this.item._originData;
    const { name } = this.item;
    const { role } = values;

    set(formTemplate, 'metadata.annotations["iam.kubeclipper.io/role"]', role);

    const data = {
      userName: name,
      role,
    };

    return this.projectUserStore.edit(
      { project: this.project, id: name },
      data
    );
  };
}

export default Edit;
