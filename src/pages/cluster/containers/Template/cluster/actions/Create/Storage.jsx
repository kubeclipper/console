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
import Base from 'components/Form';
import { rootStore } from 'stores';
import { filter } from 'lodash';
import StorageForm from 'pages/cluster/components/plugin/StorageForm';

@observer
export default class Storage extends Base {
  init() {
    this.store = rootStore.clusterStore;
  }

  allowed = () => Promise.resolve();

  get isStep() {
    return true;
  }

  get name() {
    return 'storage';
  }

  get defaultValue() {
    return {
      defaultStorage: false,
    };
  }

  get isFormRender() {
    return true;
  }

  get tags() {
    const { storageEnable } = this.props.context;
    return filter(storageEnable, (item) => item.length) || [];
  }

  get tagsOption() {
    const value = this.tags.map((item) => ({
      label: item,
      value: item,
    }));

    return [
      ...value,
      {
        label: t('No Setting'),
        value: false,
      },
    ];
  }

  handleOnchange = () => {
    setTimeout(() => {
      const { defaultStorage } = this.formRef.current.getFieldValue();
      if (!this.tags.includes(defaultStorage)) {
        this.updateFormValue('defaultStorage', false);
      }
    });
  };

  get formItems() {
    return [
      [
        {
          name: 'storage',
          label: '',
          component: (
            <StorageForm
              context={this.props.context}
              updateContext={this.updateContext}
              onChange={this.handleOnchange}
              store={this.store}
            />
          ),
          wrapperCol: {
            xs: {
              span: 24,
            },
            sm: {
              span: 18,
            },
          },
        },
      ],
      [
        {
          name: 'enableStorages',
          label: t('Enable Storages'),
          type: 'tags',
          tags: this.tags,
        },
        {
          name: 'defaultStorage',
          label: t('Default Storage'),
          type: 'select',
          options: this.tagsOption,
        },
      ],
    ];
  }
}
