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
import { set } from 'lodash';
import { rootStore } from 'stores';
import FORM_TEMPLATES from 'utils/form.templates';
import { getOptionsByListData } from 'utils';

@observer
class Create extends ModalAction {
  init() {
    this.store = rootStore.projectStore;
    this.userStore = rootStore.userStore;

    this.getUser();
  }

  async getUser() {
    await this.userStore.fetchList({
      limit: -1,
    });
  }

  static id = 'project-create';

  static buttonText = t('Create');

  static title = t('Create');

  static policy = 'projects:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get module() {
    return 'projects';
  }

  get currentUser() {
    return rootStore.user.username;
  }

  get defaultValue() {
    const { name, description } = this.item;
    return {
      name,
      description,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Project Name'),
        type: 'input-name',
        required: true,
        maxLength: 32,
      },
      {
        name: 'manager',
        label: t('Project Manager'),
        type: 'select',
        required: true,
        options: getOptionsByListData(this.userStore.list.data),
      },
      {
        name: 'description',
        label: t('description'),
        type: 'input',
        maxLength: 256,
      },
    ];
  }

  onSubmit = (values) => {
    const formTemplate = FORM_TEMPLATES[this.module]();

    const { name, manager, description } = values;

    set(formTemplate, 'metadata.name', name);
    set(
      formTemplate,
      'metadata.annotations["kubeclipper.io/description"]',
      description
    );

    set(formTemplate, 'spec.manager', manager);

    return this.store.create(formTemplate);
  };
}

export default Create;
