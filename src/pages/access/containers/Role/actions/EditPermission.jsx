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
import { observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { set, uniq } from 'lodash';
import { toJS } from 'mobx';
import { rootStore } from 'stores';
import EditAuthorization from 'pages/access/componnets/EditAuthorization';

@observer
class Edit extends ModalAction {
  init() {
    this.store = rootStore.roleStore;

    this.getRoleTemplate();
  }

  static id = 'role-edit';

  static buttonText = t('Edit Permission');

  static title = t('Edit Role Permission');

  static policy = 'roles:edit';

  static get modalSize() {
    return 'middle';
  }

  get wrapperCol() {
    return { span: 24 };
  }

  static isInternal = (item) => item.isInternal;

  static allowed = (item) => Promise.resolve(!this.isInternal(item));

  authRef = React.createRef();

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
        name: 'permission',
        label: '',
        type: 'label',
        component: (
          <EditAuthorization
            ref={this.authRef}
            roleTemplates={toJS(this.store.roleTemplates.data)}
            formTemplate={this.item}
            tabStyles={{ width: '180px' }}
            isModlal
          />
        ),
      },
    ];
  }

  async getRoleTemplate() {
    await this.store.fetchRoleTemplates({ limit: -1 });
  }

  onSubmit = () => {
    const formTemplate = this.item._originData;

    const { roleTemplates } = this.authRef.current;
    const templates = uniq([...roleTemplates]);

    const { name, resourceVersion } = this.item;

    set(
      formTemplate,
      'metadata.annotations["kubeclipper.io/aggregation-roles"]',
      JSON.stringify(templates)
    );

    return this.store.edit({ id: name, resourceVersion }, formTemplate);
  };
}

export default Edit;
