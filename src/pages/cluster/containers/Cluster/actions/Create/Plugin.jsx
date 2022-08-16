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
import BaseForm from 'components/Form';
import PluginForm from 'pages/cluster/components/plugin/PluginForm';
import { rootStore } from 'stores';

@observer
export default class Plugin extends BaseForm {
  init() {
    this.store = rootStore.clusterStore;
  }

  allowed = () => Promise.resolve();

  get isStep() {
    return true;
  }

  get name() {
    return 'plugins';
  }

  get defaultValue() {
    return {};
  }

  get isFormRender() {
    return true;
  }

  get templates() {
    return this.props.context.templates || [];
  }

  get formItems() {
    return [
      [
        {
          name: 'plugins',
          label: '',
          component: (
            <PluginForm
              context={this.props.context}
              updateContext={this.updateContext}
              templates={this.templates}
              useTemplate
            />
          ),
          wrapperCol: {
            xs: {
              span: 24,
            },
            sm: {
              span: 19,
            },
          },
          style: { minHeight: '650px' },
        },
      ],
    ];
  }
}
