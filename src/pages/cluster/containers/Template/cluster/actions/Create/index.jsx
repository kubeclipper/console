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
import { StepAction } from 'containers/Action';
import { rootStore } from 'stores';
import { arrayInputValue } from 'utils';
import { computeAutoDetection } from 'resources/cluster';
import { flatten, get, set, omit, assign, filter } from 'lodash';

import Cluster from './Cluster';
import Plugin from './Plugin';
import Storage from './Storage';
import Confirm from './Confirm';

// eslint-disable-next-line no-unused-vars
import styles from './index.less';

@observer
export default class Create extends StepAction {
  static id = 'create';

  static title = t('Add');

  static path = '/cluster/template/create';

  static policy = 'clusters:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get listUrl() {
    return '/cluster/template';
  }

  get name() {
    const isEdit = this.props.match.params?.id;
    return isEdit ? t('Edit Template') : t('Create Template');
  }

  get className() {
    return 'cluster-create';
  }

  get hasPlugin() {
    const hasPlugin =
      (this.clusterStore?.components || []).filter(
        ({ category }) => category !== 'storage'
      ).length > 0;

    return hasPlugin;
  }

  get steps() {
    return [
      {
        title: t('Cluster Config'),
        component: Cluster,
      },
      {
        title: t('Storage Config'),
        component: Storage,
      },
      ...(this.hasPlugin
        ? [
            {
              title: t('Plugin Manage'),
              component: Plugin,
            },
          ]
        : []),
      {
        title: t('Confirm Config'),
        component: Confirm,
      },
    ];
  }

  init() {
    this.clusterStore = rootStore.clusterStore;
    this.templatesStore = rootStore.templatesStore;

    this.fetchComponents();
    this.getEditVals();
  }

  async fetchComponents() {
    const components = await this.clusterStore.fetchComponents();

    this.updateData({ components });
  }

  async getEditVals() {
    const { id } = this.props.match.params;
    if (id) {
      const vals = await this.templatesStore.query({
        fieldSelector: `metadata.name=${id}`,
      });

      const { templateName, templateDescription, flatData, _originData } = vals;

      this.updateData({
        templateName,
        templateDescription,
        ...flatData,
        _originData,
      });
    }
  }

  getRegistry = (registry) => flatten(arrayInputValue(registry));

  /* base64 加密 mask: true 的属性 */
  encodeProperty(components, enabledComponents) {
    enabledComponents.forEach(({ config, name }) => {
      const item = components.find(({ name: cname }) => name === cname);

      const { properties = {} } = item.schema;

      const encode = (propValue) => window.btoa(propValue);

      for (const [prop, propValue] of Object.entries(properties)) {
        if (propValue.mask) {
          config[prop] = encode(config[prop]);
        }
      }
    });
    return enabledComponents;
  }

  getComponents = ({
    storage = {},
    plugins = {},
    components = [],
    defaultStorage = '',
  }) => {
    const enabledComponents = [];
    get(storage, 'tabs', []).forEach(({ name, formData }) => {
      (formData || []).forEach((item) => {
        if (item.enable) {
          const s = {
            name,
            config: assign(omit(item, 'enable'), {
              isDefaultSC: item.scName === defaultStorage,
            }),
          };

          const checkparams = ['mountOptions', 'monitors'];
          checkparams.forEach((_item) => {
            if (item?.[_item]?.length) {
              s.config[_item] = filter(item[_item], (val) => Boolean(val));
            }
          });

          enabledComponents.push(s);
        }
      });
    });

    Object.entries(get(plugins, 'forms', {})).forEach(([name, value]) => {
      const isEnabled = get(value, 'formData.enable');

      if (isEnabled) {
        const p = { name, config: omit(get(value, 'formData'), 'enable') };
        enabledComponents.push(p);
      }
    });

    enabledComponents.forEach((c) => {
      const item = components.find(({ name }) => name === c.name);
      c.version = item.version;
    });

    return this.encodeProperty(components, enabledComponents);
  };

  onSubmit = (values) => {
    const {
      templateName,
      templateDescription,

      /* step1: Node config */
      // region,
      /* step2: Cluster config */
      // image
      offline,
      localRegistry,
      certSANs,
      etcdDataDir,
      kubectlDataDir,
      kubernetesVersionOnline,
      kubernetesVersionOffline,
      // container runtime
      containerRuntimeType,
      dockerInsecureRegistry,
      dockerRootDir,
      dockerVersion,
      containerdInsecureRegistry,
      containerdRootDir,
      containerdVersionOnline,
      containerdVersionOffline,
      // backupPoint,
      // network
      dnsDomain,
      workerNodeVip,
      IPManger,
      IPVersion,
      calicoMode,
      cniType,
      proxyMode,
      podIPv4CIDR,
      podIPv6CIDR,
      serviceSubnet,
      serviceSubnetV6,
      mtu,
      // cluster
      // description,
      // externalIP,
      // labels,
    } = values;

    const isIPv4 = IPVersion === 'IPv4';
    const servicesCidr = isIPv4 ? [podIPv4CIDR] : [podIPv4CIDR, podIPv6CIDR];
    const podCidr = isIPv4 ? [serviceSubnet] : [serviceSubnet, serviceSubnetV6];
    const { IPv4AutoDetection, IPv6AutoDetection } =
      computeAutoDetection(values);

    const config = {
      offline,
      certSANs: arrayInputValue(certSANs),
      localRegistry,
      workerNodeVip,
      kubernetesVersion: offline
        ? kubernetesVersionOffline
        : kubernetesVersionOnline,
      containerRuntime: {
        type: containerRuntimeType,
        ...(containerRuntimeType === 'docker'
          ? {
              version: dockerVersion,
              insecureRegistry: this.getRegistry(dockerInsecureRegistry), // dockerInsecureRegistry,
              rootDir: dockerRootDir,
            }
          : {
              version: offline
                ? containerdVersionOffline
                : containerdVersionOnline,
              insecureRegistry: this.getRegistry(containerdInsecureRegistry),
              rootDir: containerdRootDir,
            }),
      },
      networking: {
        ipFamily: IPVersion,
        services: {
          cidrBlocks: servicesCidr,
        },
        dnsDomain,
        pods: {
          cidrBlocks: podCidr,
        },
        workerNodeVip,
        proxyMode,
      },
      kubeProxy: {},
      etcd: {
        dataDir: etcdDataDir,
      },
      kubelet: {
        rootDir: kubectlDataDir,
      },
      cni: {
        type: cniType,
        calico: {
          IPv4AutoDetection,
          IPv6AutoDetection,
          mode: calicoMode,
          IPManger,
          mtu,
        },
      },
      addons: this.getComponents(values),
    };

    // eslint-disable-next-line no-console
    console.log('config', config);

    const params = {
      templateName,
      templateDescription,
      pluginName: 'kubernetes',
      pluginVersion: 'v1',
      pluginCategory: 'kubernetes',
    };

    const { id } = this.props.match.params;

    if (id) {
      const baseVals = this.state.data._originData;

      set(baseVals, 'metadata.annotations', {
        'kubeclipper.io/display-name': templateName,
        'kubeclipper.io/description': templateDescription,
      });
      set(baseVals, 'config', config);

      return this.templatesStore.patch({ id }, baseVals);
    }
    return this.templatesStore.create(params, config);
  };
}
