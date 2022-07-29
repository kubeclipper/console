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
import { arrayInputValue, arrayInput2Label, encodeProperty } from 'utils';
import { formatNodesWithLabel } from 'resources/node';
import { computeAutoDetection } from 'resources/cluster';
import { flatten, get, omit, assign, filter } from 'lodash';

import Node from './Node';
import Cluster from './Cluster';
import Plugin from './Plugin';
import Storage from './Storage';
import Confirm from './Confirm';

// eslint-disable-next-line no-unused-vars
import styles from './index.less';

@observer
export default class Create extends StepAction {
  static id = 'create';

  static title = t('Create Cluster');

  static path = '/cluster/create';

  static policy = 'clusters:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get isCreateQuickly() {
    const { useTemplate = false } = this.state.data;
    return useTemplate;
  }

  get listUrl() {
    return '/cluster';
  }

  get name() {
    return t('create cluster');
  }

  get className() {
    return 'cluster-create';
  }

  get hasPlugin() {
    const hasPlugin =
      (this.store?.components || []).filter(
        ({ category }) => category !== 'storage'
      ).length > 0;

    return hasPlugin;
  }

  get steps() {
    return [
      {
        title: t('Node Config'),
        component: Node,
      },
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
    this.store = rootStore.clusterStore;
    this.templatesStore = rootStore.templatesStore;

    this.fetchComponents();
    this.fetchTemplates();
    this.fetchVersion();
  }

  async fetchComponents() {
    const components = await this.store.fetchComponents();
    this.updateData({ components });
  }

  async fetchTemplates() {
    const templates = await this.templatesStore.fetchAll();
    this.updateData({ templates });
  }

  async fetchVersion() {
    await this.store.fetchVersion({ limit: -1 });
  }

  get successText() {
    return t('Cluster {name} is installing.', { name: this.instanceName });
  }

  getRegistry = (registry) => flatten(arrayInputValue(registry));

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

    return encodeProperty(components, enabledComponents);
  };

  onSubmit = (values) => {
    const {
      /* step1: Node config */
      region,
      /* step2: Cluster config */
      // image
      offline,
      localRegistry,
      kubernetesVersionOffline,
      kubernetesVersionOnline,
      certSANs,
      etcdDataDir,
      // container runtime
      containerRuntimeType,
      dockerInsecureRegistry,
      dockerRootDir,
      dockerVersion,
      containerdInsecureRegistry,
      containerdRootDir,
      containerdVersionOnline,
      containerdVersionOffline,
      backupPoint,
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
      name,
      description,
      externalIP,
      labels,
    } = values;

    const isIPv4 = IPVersion === 'IPv4';
    const servicesCidr = isIPv4 ? [podIPv4CIDR] : [podIPv4CIDR, podIPv6CIDR];
    const podCidr = isIPv4 ? [serviceSubnet] : [serviceSubnet, serviceSubnetV6];

    const { IPv4AutoDetection, IPv6AutoDetection } =
      computeAutoDetection(values);

    const externalIPLabel = externalIP
      ? { 'kubeclipper.io/externalIP': externalIP }
      : {};

    const offlineAnnotations = offline ? { 'kubeclipper.io/offline': '' } : {};

    const params = {
      kind: 'Cluster',
      apiVersion: 'core.kubeclipper.io/v1',
      metadata: {
        name,
        labels: {
          'topology.kubeclipper.io/region': region,
          'kubeclipper.io/backupPoint': backupPoint,
          ...externalIPLabel,
          ...arrayInput2Label(labels),
        },
        annotations: {
          'kubeclipper.io/description': description,
          ...offlineAnnotations,
        },
      },
      provider: {
        name: 'kubeadm',
      },
      certSANs: arrayInputValue(certSANs),
      masters: formatNodesWithLabel(values).master,
      workers: formatNodesWithLabel(values).worker || [],
      localRegistry,
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

    return this.store.create(params);
  };
}
