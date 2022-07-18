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
import BaseForm from 'components/Form';
import { arrayInputValue } from 'utils';
import { get, flatten, isEmpty } from 'lodash';

export class ConfirmStep extends BaseForm {
  init() {}

  get title() {
    return 'ConfirmStep';
  }

  get name() {
    return 'ConfirmStep';
  }

  get isStep() {
    return true;
  }

  allowed = () => Promise.resolve();

  get wrapperCol() {
    return {
      span: 24,
    };
  }

  goStep(index) {
    this.props.goStep(index);
  }

  get defaultValue() {
    return {};
  }

  getNodesName = () => {
    const NODES = ['master', 'worker'];
    const {
      context: { nodes },
    } = this.props;
    const obj = {};
    NODES.forEach((key) => {
      const node = nodes.find((v) => v.key === key);

      if (node) {
        const { value = [] } = node;
        obj[key] = (value || []).map((v) => v.hostname);
      }
    });

    return obj;
  };

  notFilled(label, key, func) {
    const { context } = this.props;
    const value = context[key];

    if (isEmpty(value)) return [];

    if (value && func) {
      return [
        {
          label,
          value: func(value),
        },
      ];
    }

    if (value) {
      return [
        {
          label,
          value,
        },
      ];
    }

    return [];
  }

  formatRegistry(values) {
    return flatten(arrayInputValue(values));
  }

  containerRuntimeItem() {
    const {
      context: { containerRuntimeType, dockerVersion, containerdVersion },
    } = this.props;
    const isDocker = containerRuntimeType === 'docker';

    if (isDocker) {
      return [
        {
          label: t('Docker Version'),
          value: dockerVersion,
        },
        ...this.notFilled(t('Docker Data Path'), 'dockerRootDir'),
        ...this.notFilled(
          t('Docker Registry'),
          'dockerInsecureRegistry',
          this.formatRegistry
        ),
      ];
    }
    return [
      {
        label: t('Containerd Version'),
        value: containerdVersion,
      },
      ...this.notFilled(t('Containerd Data Path'), 'containerdRootDir'),
      ...this.notFilled(
        t('Containerd Registry'),
        'containerdInsecureRegistry',
        this.formatRegistry
      ),
    ];
  }

  dualStackItem() {
    const {
      context: {
        IPVersion,
        pod_network_underlay,
        IPv4AutoDetection,
        podIPv4CIDR,
        pod_network_underlay_v6,
        podIPv6CIDR,
        IPv6AutoDetection,
        serviceSubnet,
        serviceSubnetV6,
      },
    } = this.props;
    const isDualStack = IPVersion === 'dualStack';
    if (isDualStack) {
      return [
        {
          label: t('Pod Network Underlay'),
          value: pod_network_underlay,
        },
        ...(pod_network_underlay !== 'first-found'
          ? [
              {
                label: t('IpV4 Autodetection'),
                value: IPv4AutoDetection,
              },
            ]
          : []),
        {
          label: t('Pod V4 Cidr'),
          value: podIPv4CIDR,
        },
        {
          label: t('Pod V6 Network Underlay'),
          value: pod_network_underlay_v6,
        },
        ...(pod_network_underlay_v6 !== 'first-found'
          ? [
              {
                label: t('IPV6 Autodetection'),
                value: IPv6AutoDetection,
              },
            ]
          : []),
        {
          label: t('Pod V6 Cidr'),
          value: podIPv6CIDR,
        },
        {
          label: t('IPv4 Service Subnet'),
          value: serviceSubnet,
        },
        {
          label: t('IPv6 Service Subnet'),
          value: serviceSubnetV6,
        },
      ];
    }

    return [
      {
        label: t('Pod Network Underlay'),
        value: pod_network_underlay,
      },
      ...(pod_network_underlay !== 'first-found'
        ? [
            {
              label: t('IpV4 Autodetection'),
              value: IPv4AutoDetection,
            },
          ]
        : []),
      {
        label: t('Pod V4 Cidr'),
        value: podIPv4CIDR,
      },
      {
        label: t('Service Subnet'),
        value: serviceSubnet,
      },
    ];
  }

  getClusterItems = () => {
    const { context } = this.props;
    const {
      name,
      offline,
      kubernetesVersion,
      containerRuntimeType,
      dnsDomain,
      cniType,
      calicoMode,
      ipvs,
      IPManger,
      IPVersion,
      mtu,
    } = context;
    return [
      {
        label: t('Cluster Name'),
        value: name,
      },
      ...this.notFilled(t('Description'), 'description'),
      ...this.notFilled(t('External Access IP'), 'externalIP'),
      {
        label: t('Image Type'),
        value: offline ? t('Offline') : t('Online'),
      },
      ...this.notFilled(t('LocalRegistry'), 'localRegistry'),
      {
        label: t('K8S Version'),
        value: kubernetesVersion,
      },
      ...this.notFilled(t('ETCD Data Dir'), 'etcdDataDir'),
      ...this.notFilled(t('CertSANs'), 'certSANs', arrayInputValue),
      {
        label: t('Container Runtime'),
        value: containerRuntimeType,
      },
      ...this.containerRuntimeItem(),
      {
        label: t('DNS Domain'),
        value: dnsDomain,
      },
      ...this.notFilled(t('WorkerNode Vip'), 'workerNodeVip'),
      {
        label: t('CNI Type'),
        value: cniType,
      },
      {
        label: t('Calico Mode'),
        value: calicoMode,
      },
      {
        label: t('Ipvs'),
        value: ipvs,
      },
      {
        label: t('IPManger'),
        value: IPManger,
      },
      {
        label: t('IPVersion'),
        value: IPVersion,
      },
      ...this.dualStackItem(),
      {
        label: t('MTU'),
        value: mtu,
      },
    ];
  };

  getPluginsItems = () => {
    const { context } = this.props;
    const enablePaaS =
      get(context, 'plugins.forms.kubesphere.formData.enable') || false;

    return [
      {
        label: t('PaaS Platform'),
        value: enablePaaS ? t('Enabled') : t('Not Config'),
      },
    ];
  };

  getStorageItems = () => {
    const { context } = this.props;
    const storagesTabs = get(context, 'storage.tabs') || [];

    const result = [];

    storagesTabs.forEach((item) => {
      if (item.formData.length) {
        item.formData.forEach((_item) => {
          result.push({
            label: item.name,
            value: _item.enable ? _item.scName : t('Not Config'),
          });
        });
      } else {
        result.push({
          label: item.name,
          value: t('Not Config'),
        });
      }
    });

    return result;
  };

  get formItems() {
    const { context } = this.props;
    // eslint-disable-next-line no-console
    console.log('context', context);

    const { worker = null } = this.getNodesName();

    return [
      [
        {
          name: 'node',
          type: 'descriptions',
          title: t('Node Config'),
          onClick: () => {
            this.goStep(0);
          },
          items: [
            {
              label: t('Master Node'),
              value: this.getNodesName().master,
              span: 3,
              inline: true,
            },
            ...(worker
              ? [
                  {
                    label: t('Worker Node'),
                    value: worker,
                    span: 3,
                    inline: true,
                  },
                ]
              : []),
          ],
        },
      ],
      [
        {
          name: 'cluster',
          type: 'descriptions',
          title: t('Cluster Config'),
          onClick: () => {
            this.goStep(1);
          },
          items: this.getClusterItems(),
        },
      ],
      [
        {
          name: 'storage',
          type: 'descriptions',
          title: t('Storage Config'),
          onClick: () => {
            this.goStep(2);
          },
          items: this.getStorageItems(),
        },
      ],
      [
        {
          name: 'plugin',
          type: 'descriptions',
          title: t('Plugins Config'),
          onClick: () => {
            this.goStep(3);
          },
          items: this.getPluginsItems(),
        },
      ],
    ];
  }
}

export default observer(ConfirmStep);
