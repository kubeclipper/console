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
import { toJS } from 'mobx';
import { ModalAction } from 'containers/Action';
import { rootStore } from 'stores';
import styles from './index.less';
import {
  versionCompare,
  versionCross,
  checkExpired,
  isDisableByProviderType,
} from 'utils';
import { isIPv4, isDomain, isIpPort } from 'utils/validate';

@observer
export default class Upgrade extends ModalAction {
  static id = 'back-up';

  static title = t('Cluster Upgrade');

  get name() {
    return t('Cluster Upgrade');
  }

  async init() {
    this.store = rootStore.clusterStore;
    this.registryStore = rootStore.registryStore;
    await this.getVersion();
    await this.getCommonRegistry();
    await this.initDefaultValue();
  }

  initDefaultValue = async () => {
    const { offline, localRegistry } = this.item;
    this.setState({
      offline,
      targetVersions: this.getMetaVersion(offline),
      localRegistry,
    });
    this.updateDefaultValue();
  };

  get defaultValue() {
    const { offline, localRegistry = '' } = this.state;
    const versions = this.getMetaVersion(offline);
    return {
      offline,
      version: versions[0]?.value,
      localRegistry,
    };
  }

  get alert() {
    return {
      message: (
        <div className={styles['upgrade-tip']}>
          <div>
            {t('Tips:') +
              t(
                'Please Ensure that the cluster node can access the specified image'
              )}
            <br />
          </div>
          <div className={styles.text}>{t('TIP_CLUSTER_UPGRADE_DESC')}</div>
        </div>
      ),
      type: 'info',
    };
  }

  handleImgType = async (offline) => {
    const versions = this.getMetaVersion(offline);

    await this.setState({
      offline,
      targetVersions: versions,
      version: versions?.[0]?.value,
    });
    this.updateDefaultValue();
  };

  async getVersion() {
    await this.store.fetchVersion({ limit: -1 });
  }

  async getCommonRegistry() {
    await this.registryStore.fetchList();
  }

  static policy = 'clusters:edit';

  static isStatusRunning(item) {
    if (item.status === 'Running') {
      return true;
    }
    return false;
  }

  static isLicensExpiration = (item) =>
    checkExpired(item.licenseExpirationTime);

  static allowed = (item) =>
    Promise.resolve(
      this.isLicensExpiration(item) &&
        this.isStatusRunning(item) &&
        !isDisableByProviderType(item, ['kubeadm'])
    );

  getMetaVersion(offline) {
    const versionTitle = offline ? 'offlineVersion' : 'onlineVersion';
    const { kubernetesVersion: currentVersion } = this.item;

    const data = this.store[versionTitle].filter(
      ({ version }) => versionCompare(currentVersion, version) < 0
    );
    return (data || []).map(({ version }) => ({
      value: version,
      label: version,
    }));
  }

  checkk8sRegistry = (rule, value) => {
    if (!value) return Promise.resolve(true);

    const checkFunc = (item) => {
      if (!item) return true;
      if (isDomain(item) || isIPv4(item) || isIpPort(item)) {
        return true;
      }
      return false;
    };

    if (!checkFunc(value)) {
      return Promise.reject(t('Please enter a legal registry'));
    }

    return Promise.resolve(true);
  };

  get isOffLine() {
    const { offline } = this.state;
    return offline === true;
  }

  getRegistryOptions() {
    const data = toJS(this.registryStore.list.data);
    return (data || []).map(({ host }) => ({
      value: host,
      label: host,
    }));
  }

  get formItems() {
    return [
      {
        name: 'offline',
        label: t('Image Type'),
        type: 'radio',
        optionType: 'default',
        options: [
          {
            label: t('Online'),
            value: false,
          },
          {
            label: t('Offline'),
            value: true,
          },
        ],
        tip: t('TIP_CLUSTER_IMAGE_TYPE_DESC'),
        onChange: this.handleImgType,
      },
      {
        name: 'version',
        label: t('Target Version'),
        type: this.isOffLine ? 'select' : 'select-input',
        options: this.state.targetVersions,
        rules: [
          {
            pattern: /^v\d+(?:\.\d+){2}$/,
            message: t(
              'Please enter the version in correct format, such as vX.Y.Z'
            ),
          },
          {
            validator: (_, value) => {
              const { kubernetesVersion: currentVersion } = this.item;
              const v = versionCompare(currentVersion, value);
              const c = versionCross(currentVersion, value);

              if (v >= 0 || c) {
                return Promise.reject(t('Target version error'));
              }
              return Promise.resolve(true);
            },
          },
        ],
      },
      {
        name: 'localRegistry',
        label: t('LocalRegistry'),
        type: 'select-input',
        placeholder: t('Please input localRegistry'),
        options: this.getRegistryOptions(),
        hidden: !this.isOffLine,
        maxLength: 256,
        tip: t('TIP_CLUSTER_LOCALREGISTRY'),
        validator: this.checkk8sRegistry,
      },
    ];
  }

  get successText() {
    return t('{name} is upgrading.', {
      action: this.name,
      name: this.item.name,
    });
  }

  get errorText() {
    return t('Unable to {action}.', {
      action: this.name,
    });
  }

  get cluster() {
    return this.props.item.name;
  }

  onSubmit = (values) => this.store.upgrade(values, { cluster: this.cluster });

  successCallback = () => this.store.fetchList({ cluster: this.cluster });
}
