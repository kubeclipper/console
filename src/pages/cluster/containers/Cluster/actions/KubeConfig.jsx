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
import { Modal, Button } from 'antd';
import KubeConfig from 'pages/cluster/components/KubeConfig';
import { CloseOutlined } from '@ant-design/icons';
import { checkExpired, isDisableByProviderType } from 'utils';

export default class KubeConfiView {
  static id = 'kubeconfig';

  static title = t('View KubeConfig File');

  static buttonText = t('View KubeConfig File');

  static get modalSize() {
    return 'middle';
  }

  static actionType = 'terminal';

  static isRunning = (item) => item.status === 'Running';

  static isLicensExpiration = (item) =>
    checkExpired(item.licenseExpirationTime);

  static policy = 'clusters:view';

  static allowed = (item) =>
    Promise.resolve(this.isRunning(item) && !isDisableByProviderType(item));

  static openTerminal = async (val) => {
    const { name } = val;

    const modal = Modal.info();
    modal.update({
      title: (
        <>
          <div>kubeconfig</div>
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
      content: <KubeConfig name={name} />,
      className: 'terminal-modal-wrpper',
    });
  };
}
