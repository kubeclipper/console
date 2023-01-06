/* eslint-disable no-unused-vars */
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
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { rootStore } from 'stores';
import { isIp, isIpPort, isDomainPath } from 'utils/validate';
import FORM_TEMPLATES from 'utils/form.templates';
import { merge } from 'lodash';

@observer
class Add extends ModalAction {
  init() {
    this.store = rootStore.registryStore;
  }

  static id = 'add';

  static title = t('Add');

  static policy = 'registries:edit';

  get module() {
    return 'registries';
  }

  get name() {
    return t('Add');
  }

  get defaultValue() {
    return {
      host: {
        prefix: 'http',
        ip: '',
      },
      tlsCheck: true,
    };
  }

  static allowed = () => Promise.resolve(true);

  checkAddress = async (_, value) => {
    const currentData = toJS(this.store.list.data);

    const { prefix, ip } = value;
    const address = `${prefix}://${ip}`;
    // 地址可以是：域名+ 端口 或 ip + 端口
    for (const item of currentData) {
      if (`${item.scheme}://${item.host}` === address)
        return Promise.reject(t('Registry Repeat'));
    }
    if (!ip) {
      return Promise.reject(t('Registry cannot be empty'));
    }
    if (!isIp(ip) && !isIpPort(ip) && !isDomainPath(ip)) {
      return Promise.reject(t('Please input correct ip or domain'));
    }
    return Promise.resolve();
  };

  onHostChange = (value) =>
    this.setState({
      prefix: value.prefix,
    });

  onTlsChange = (value) =>
    this.setState({
      tlsCheck: value,
    });

  get formItems() {
    const { tlsCheck = true, prefix = 'http' } = this.state;
    const isHttps = prefix === 'https';
    const isCheckTls = isHttps && tlsCheck;

    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'input',
        placeholder: t('Please input description'),
      },
      {
        name: 'host',
        label: t('Registry Address'),
        type: 'ip-group',
        validator: this.checkAddress,
        required: true,
        onChange: this.onHostChange,
      },
      {
        name: 'tlsCheck',
        label: t('TLS Check'),
        type: 'switch',
        hidden: !isHttps,
        onChange: this.onTlsChange,
      },
      {
        name: 'ca',
        label: t('CA Certificate'),
        type: 'textarea',
        placeholder: t('Please input certificate'),
        hidden: !isHttps || !isCheckTls,
      },
    ];
  }

  onSubmit = (values) => {
    const { name, host: address, description, ca, tlsCheck } = values;
    const { prefix: scheme, ip: host } = address;

    const data = {
      metadata: {
        name,
        annotations: {
          'kubeclipper.io/description': description,
        },
      },
      host,
      ca,
      scheme,
      skipVerify: !tlsCheck,
    };

    const formTemplate = merge(FORM_TEMPLATES[this.module](), data);

    return this.store.create(formTemplate);
  };
}

export default Add;
