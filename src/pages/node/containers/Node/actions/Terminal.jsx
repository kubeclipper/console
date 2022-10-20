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
import { rootStore } from 'stores';
import { Modal, Button } from 'antd';
import ContainerTerminalModal from './terminalCtl';
import { CloseOutlined } from '@ant-design/icons';

@observer
export default class Terminal extends ModalAction {
  get id() {
    return 'Terminal';
  }

  get title() {
    return t('Connect');
  }

  init() {
    this.store = rootStore.nodeStore;
  }

  static title = t('Connect Terminal');

  static allowed() {
    return Promise.resolve(true);
  }

  get defaultValue() {
    return {
      username: '',
      password: '',
      ip: this.item.ip,
      port: 22,
    };
  }

  get formItems() {
    return [
      {
        name: 'ip',
        label: t('IP'),
        type: 'input',
        required: true,
        disabled: true,
      },
      {
        name: 'port',
        label: t('Port'),
        type: 'input-number',
        required: true,
      },
      {
        name: 'username',
        label: t('Username'),
        type: 'input',
        placeholder: t('Please input your Username!'),
        required: true,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        placeholder: t('Please input your Password!'),
        required: true,
      },
    ];
  }

  get successText() {
    return t(`Connecting ${this.item.ip}`);
  }

  onSubmit = async (val) => {
    const modal = Modal.info();
    modal.update({
      title: (
        <>
          <div>{val.ip}</div>
          <Button
            type="text"
            onClick={() => {
              modal.destroy();
            }}
            icon={<CloseOutlined />}
            size="small"
          />
        </>
      ),
      icon: null,
      okText: () => '',
      content: (
        <ContainerTerminalModal
          store={this.store}
          val={val}
          id={this.item.id}
        />
      ),
      className: 'terminal-modal-wrpper',
    });

    return Promise.resolve();
  };
}
