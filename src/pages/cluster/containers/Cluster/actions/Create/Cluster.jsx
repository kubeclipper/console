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
import { toJS } from 'mobx';
import { rootStore } from 'stores';
import { message } from 'antd';
import { fqdn, subdomain } from 'utils/regex';
import {
  isIPv4,
  isIpv6,
  isDomain,
  isDomainPath,
  isIpPort,
  isNumber,
} from 'utils/validate';
import {
  clusterParams,
  IPVersionOptions,
  proxyModeOptions,
  containerRuntimeOption,
  networkPluginOption,
  calicoModeOption,
  podNetworkUnderlayOptions,
  inputHelpByUnderlayType,
} from 'resources/cluster';
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { versionCompare } from 'utils';

const cidrRegex = require('cidr-regex');

const {
  nodeStore,
  regionStore,
  clusterStore,
  templateStore,
  backupPointStore,
} = rootStore;

@observer
export default class Cluster extends BaseForm {
  init() {
    this.store = clusterStore;
    this.nodeStore = nodeStore;
    this.regionStore = regionStore;
    this.templateStore = templateStore;
    this.backupPointStore = backupPointStore;

    this.getCommonRegistry();
    this.getBackupPoint();
  }

  allowed = () => Promise.resolve();

  get isStep() {
    return true;
  }

  get defaultValue() {
    const [firstK8sOnline] = this.getMetaVersion('k8s', 'onlineVersion');
    const [firstK8sOffline] = this.getMetaVersion('k8s', 'offlineVersion');
    const [firstContainerdOnline] = this.getMetaVersion(
      'containerd',
      'onlineVersion'
    );
    const [firstContainerdOffline] = this.getMetaVersion(
      'containerd',
      'offlineVersion'
    );

    return {
      ...clusterParams,
      offline: !!this.state.offline,
      kubernetesVersionOnline: firstK8sOnline.value,
      kubernetesVersionOffline: firstK8sOffline.value,
      containerdVersionOffline: firstContainerdOffline.value,
      containerdVersionOnline: firstContainerdOnline.value,
      ...this.props.context,
    };
  }

  get labelCol() {
    return {
      xs: { span: 7 },
      sm: { span: 5 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 10 },
      sm: { span: 8 },
    };
  }

  async getCommonRegistry() {
    await this.templateStore.fetchList();
    this.updateDefaultValue();
  }

  async getBackupPoint() {
    await this.backupPointStore.fetchList();
  }

  get getBackupPointOptions() {
    const options = (this.backupPointStore.list.data || []).map((item) => ({
      value: item.name,
      label: item.name,
    }));
    return options;
  }

  getMetaVersion(type, online = 'offlineVersion') {
    const data = toJS(this.store[online]).filter(({ name }) => name === type);

    return (data || []).map(({ version }) => ({
      value: version,
      label: version,
    }));
  }

  get getRegistryOptions() {
    const data = toJS(this.templateStore.list.data);
    return (data || []).map(({ host }) => ({
      value: host,
      label: host,
    }));
  }

  // eslint-disable-next-line no-unused-vars
  checkVip = (rule, value) =>
    // const existNodeList = nodeStore.list.data.some((v) => v.ip === value);
    // if (!value) {
    //   return Promise.reject(t('Please input vip！'));
    // }
    // if (existNodeList) {
    //   return Promise.reject(t('The ip is already occupied！'));
    // }
    Promise.resolve(true);

  get isOffLine() {
    const { offline } = this.state;
    return offline === true;
  }

  get isDocker() {
    const type = this.state.containerRuntimeType;
    return type === 'docker';
  }

  get nameForStateUpdate() {
    return [
      'offline',
      'containerRuntimeType',
      'IPVersion',
      'cniType',
      'calicoMode',
      'pod_network_underlay',
      'pod_network_underlay_v6',
    ];
  }

  get isCalico() {
    const { cniType } = this.state;

    return cniType === 'calico';
  }

  get isDualStack() {
    const { IPVersion } = this.state;

    return IPVersion === 'IPv4+IPv6';
  }

  checkIpOrDomain = (rule, value) => {
    const { pod_network_underlay } = this.state;
    if (pod_network_underlay === 'can-reach') {
      if (isIPv4(value) || isDomain(value)) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(
          t(
            'Please enter a legal ip or domain, such as: 10.0.0.1、baidu.com、www.google.com'
          )
        );
      }
    }

    return Promise.resolve(true);
  };

  checkIpOrDomainV6 = (rule, value) => {
    const { pod_network_underlay } = this.state;
    if (pod_network_underlay === 'can-reach') {
      if (isIpv6(value) || isDomain(value)) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(
          t(
            'Please enter a legal ip or domain, such as: 3001:db8::200、baidu.com、www.google.com'
          )
        );
      }
    }

    return Promise.resolve(true);
  };

  checkName = (rule, value) => {
    const { isPrev } = this.state;

    if (!value) {
      if (isPrev) return Promise.resolve(true);

      message.error(t('Please input cluster name'));
      return Promise.reject(t('Please input cluster name'));
    }

    if (isNumber(value)) {
      return Promise.reject(t('The name cannot be all numbers'));
    }

    if (!subdomain.test(value)) {
      return Promise.reject(
        t('The enter does not meet the subdomain specification!')
      );
    }

    return Promise.resolve(true);
  };

  checkCertSANs = (rule, value = []) => {
    const checkFunc = (item) => {
      if (!item) return true;
      if (isIPv4(item) || isDomain(item)) {
        return true;
      }
      return false;
    };

    const isInValide = value.some((it) => !checkFunc(it.value));

    if (isInValide) {
      return Promise.reject(t('Please enter a legal ip or domain'));
    }

    return Promise.resolve(true);
  };

  checkk8sRegistry = (rule, value) => {
    if (!value) return Promise.resolve(true);

    const checkFunc = (item) => {
      if (!item) return true;
      if (
        isDomain(item) ||
        isDomainPath(item) ||
        isIPv4(item) ||
        isIpPort(item)
      ) {
        return true;
      }
      return false;
    };

    if (!checkFunc(value)) {
      return Promise.reject(t('Please enter a legal registry'));
    }

    return Promise.resolve(true);
  };

  checkRegistry = (rule, value) => {
    if (!value) return Promise.resolve(true);

    const checkFunc = (item) => {
      if (!item) return true;
      if (
        isDomain(item) ||
        isDomainPath(item) ||
        isIPv4(item) ||
        isIpPort(item)
      ) {
        return true;
      }
      return false;
    };

    const isInValide = value.some((it) => !checkFunc(it.value));

    if (isInValide) {
      return Promise.reject(t('Please enter a legal registry'));
    }

    return Promise.resolve(true);
  };

  checkLabels = (rule, value = []) => {
    const checkFunc = (item) => {
      if (!item) return true;
      if ((item.key && item.value) || (!item.key && !item.value)) {
        return true;
      }
      return false;
    };

    const isInValide = value.some((it) => !checkFunc(it.value));

    if (isInValide) {
      return Promise.reject(t('Please enter legal label'));
    }

    return Promise.resolve(true);
  };

  updateInsecureRegistry = (value, type) => {
    const checkFunc = (item) => {
      if (!item) return false;
      if (
        isDomain(item) ||
        isIPv4(item) ||
        isIpPort(item) ||
        isDomainPath(item)
      ) {
        return true;
      }
      return false;
    };

    const getInsecureRegistry = (isDocker) =>
      isDocker ? 'dockerInsecureRegistry' : 'containerdInsecureRegistry';

    let updateFormKey = getInsecureRegistry(this.isDocker);
    if (type) {
      updateFormKey = getInsecureRegistry(type === 'docker');
    }

    if (checkFunc(value)) {
      this.updateFormValue(updateFormKey, [
        { index: 0, value, disabled: true },
      ]);
    }
  };

  onK8SRegistryChange = (e) => {
    this.updateInsecureRegistry(e);
  };

  get localRegistryValue() {
    return this.getFormInstance().getFieldValue('localRegistry');
  }

  onRunTimeTypeChange = (type) => {
    if (this.isOffLine) {
      this.updateInsecureRegistry(this.localRegistryValue, type);
    }
  };

  onK8SVersionChange = (value) => {
    const isAfter20 = versionCompare('v1.20.0', value) <= 0;
    const isAfter24 = versionCompare('v1.24.0', value) <= 0;

    const containerRuntimeType = isAfter20 ? 'containerd' : 'docker';
    this.updateFormValue('containerRuntimeType', containerRuntimeType);
    this.updateInsecureRegistry(this.localRegistryValue, containerRuntimeType);
    this.setState({
      containerRuntimeType,
    });

    this.updateContext({ isAfter24 });
  };

  checkIP = async (_, value) => {
    if (value && !isIPv4(value)) {
      return Promise.reject(t('IP invalid'));
    }
    return Promise.resolve();
  };

  get formItems() {
    const { pod_network_underlay, pod_network_underlay_v6 } = this.state;
    const { isAfter24 = false } = this.props.context;

    const underlayInputHelp =
      inputHelpByUnderlayType[pod_network_underlay] || '';
    const underlayInputHelpV6 =
      inputHelpByUnderlayType[pod_network_underlay_v6] || '';

    const runtimeOption = isAfter24
      ? containerRuntimeOption.filter(({ value }) => value === 'containerd')
      : containerRuntimeOption;

    return [
      [
        {
          name: 'offline',
          label: t('Image Type'),
          type: 'radio',
          optionType: 'default',
          required: true,
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
          extra: this.isOffLine
            ? t(
                'Offline installation: the public network environment is not required, and the configuration package is pulled from the local warehouse.'
              )
            : t(
                'Online installation: the public network environment is required, and the configuration package is downloaded from the official website.'
              ),
        },
        {
          name: 'localRegistry',
          label: t('LocalRegistry'),
          type: 'select-input',
          placeholder: t('Please input localRegistry'),
          options: this.getRegistryOptions,
          maxLength: 256,
          validator: this.checkk8sRegistry,
          onChange: this.onK8SRegistryChange,
          extra: this.isOffLine
            ? t(
                'The image is pulled from the local warehouse by default. You can also fill in other offline image warehouses. The components will inherit the warehouse address by default. Please ensure that there are relevant component images in the warehouse; The component will also provide independent image warehouse parameters. After setting, the component image will be pulled from this address.'
              )
            : t(
                'Images are pulled from the official image warehouse by default, such as k8s images from k8s gcr. IO pull, calico from docker IO pull. You can also fill in other image warehouses, and the components will inherit the warehouse address by default. Please ensure that there are relevant component images in the warehouse; The component will also provide independent image warehouse parameters. After setting, the component image will be pulled from this address.'
              ),
        },
        {
          name: 'kubernetesVersionOffline',
          label: t('K8S Version'),
          type: 'select',
          required: true,
          options: this.getMetaVersion('k8s', 'offlineVersion'),
          onChange: this.onK8SVersionChange,
          hidden: !this.isOffLine,
        },
        {
          name: 'kubernetesVersionOnline',
          label: t('K8S Version'),
          type: 'select',
          required: true,
          options: this.getMetaVersion('k8s', 'onlineVersion'),
          onChange: this.onK8SVersionChange,
          hidden: this.isOffLine,
        },
        {
          name: 'etcdDataDir',
          label: t('{name} Data Dir', { name: 'ETCD' }),
          type: 'input',
          maxLength: 256,
          placeholder: t('Please input {name} data dir', { name: 'ETCD' }),
          tip: t('{name} Data Dir', { name: 'ETCD' }),
        },
        {
          name: 'kubectlDataDir',
          label: t('{name} Data Dir', { name: 'kubectl' }),
          type: 'input',
          maxLength: 256,
          placeholder: t('Please input {name} data dir', { name: 'kubectl' }),
        },
        // certSANs 数组string， 填 ip 和域名
        {
          name: 'certSANs',
          label: t('CertSANs'),
          type: 'array-input',
          isInput: true,
          width: '100%',
          placeholder: t('Please input certSANs ip or dns'),
          tip: t('k8s cluster  certSANs ip or dns.'),
          validator: this.checkCertSANs,
        },
      ],
      [
        {
          name: 'containerRuntimeType',
          label: t('Container Runtime'),
          type: 'select',
          required: true,
          options: runtimeOption,
          onChange: this.onRunTimeTypeChange,
          tip: t(
            'K8S version before the v1.20.0, container runtime default docker, and then default containerd, after v1.24.0 not support docker.'
          ),
        },
        // docker
        {
          name: 'dockerVersion',
          label: t('Docker Version'),
          type: this.isOffLine ? 'select' : 'select-input',
          options: this.getMetaVersion('docker'),
          hidden: !this.isDocker,
          rules: [
            {
              pattern: /^\d+(?:\.\d+){2}$/,
              message: t(
                'Please enter the version in correct format, such as X.Y.Z'
              ),
            },
          ],
        },
        {
          name: 'dockerRootDir',
          label: t('Docker Data Path'),
          type: 'input',
          maxLength: 256,
          placeholder: t('Please input docker data path'),
          hidden: !this.isDocker,
          tip: t('The root dir in daemon.json.'),
        },
        {
          name: 'dockerInsecureRegistry',
          label: t('Docker Registry'),
          type: 'array-input',
          isInput: true,
          width: '100%',
          hidden: !this.isDocker,
          placeholder: t('Please input registry'),
          tip: t(
            'The registry for image, such as the insecure registry in the daemon.json of docker.'
          ),
          validator: this.checkRegistry,
        },
        // containerd
        {
          name: 'containerdVersionOffline',
          label: t('Containerd Version'),
          type: 'select',
          options: this.getMetaVersion('containerd', 'offlineVersion'),
          hidden: this.isDocker || !this.isOffLine,
          required: true,
        },
        {
          name: 'containerdVersionOnline',
          label: t('Containerd Version'),
          type: 'select',
          options: this.getMetaVersion('containerd', 'onlineVersion'),
          hidden: this.isDocker || this.isOffLine,
          required: true,
        },
        {
          name: 'containerdRootDir',
          label: t('Containerd Data Path'),
          type: 'input',
          placeholder: t('Please input containerd data path'),
          hidden: this.isDocker,
          tip: t('Root dir in config.toml'),
        },
        {
          name: 'containerdInsecureRegistry',
          label: t('Containerd Registry'),
          type: 'array-input',
          isInput: true,
          width: '100%',
          hidden: this.isDocker,
          validator: this.checkRegistry,
          placeholder: t('Please input registry'),
          tip: t(
            'The registry containerd image, registry.mirrors in the config.toml.'
          ),
        },
      ],
      // 网络
      [
        {
          name: 'dnsDomain',
          label: t('DNS Domain'),
          type: 'input',
          placeholder: t('Please input dns domain'),
          required: true,
          rules: [
            {
              pattern: fqdn,
              message: t('The enter does not meet the fqdn specification!'),
              required: true,
            },
          ],
        },
        {
          name: 'workerNodeVip',
          label: t('WorkerNode Vip'),
          type: 'ip-input',
          validator: this.checkVip,
          tip: t(
            'Used for load balancing from worker nodes to multiple master nodes, all in one no need to set.'
          ),
        },
        {
          name: 'cniType',
          label: t('CNI Type'),
          type: 'select',
          required: true,
          options: networkPluginOption,
        },
        {
          name: 'calicoMode',
          label: t('Calico Mode'),
          type: 'select',
          required: true,
          options: calicoModeOption,
          hidden: !this.isCalico,
        },
        {
          name: 'proxyMode',
          label: t('proxyMode'),
          type: 'radio',
          optionType: 'default',
          options: proxyModeOptions,
        },
        {
          name: 'IPManger',
          label: t('IPManger'),
          type: 'check',
          content: t('IPManger'),
          tip: t(
            'Calico IPAM provides additional IP allocation efficiency and flexibility, and it is recommended to enable it.'
          ),
        },
        {
          name: 'IPVersion',
          label: t('IP Version'),
          type: 'radio',
          optionType: 'default',
          options: IPVersionOptions,
        },
        {
          name: 'pod_network_underlay',
          label: t('Pod Network Underlay'),
          type: 'select',
          required: true,
          options: podNetworkUnderlayOptions,
          hidden: !this.isCalico,
          tip: podNetworkUnderlayOptions.find(
            (it) => it.value === pod_network_underlay
          )?.help,
          extra: t(
            'In dual-card network, calico will automatically select the network card that is not the default gateway'
          ),
        },
        {
          name: 'IPv4AutoDetection',
          label: t('IPv4 Autodetection'),
          type: 'input',
          required: true,
          hidden: !this.isCalico || pod_network_underlay === 'first-found',
          ...(underlayInputHelp
            ? {
                tip: underlayInputHelp,
              }
            : {}),
          validator: this.checkIpOrDomain,
        },
        {
          name: 'podIPv4CIDR',
          label: t('Pod V4 Cidr'),
          type: 'input',
          rules: [
            {
              pattern: cidrRegex({ exact: true }),
              message: t('The enter does not meet ipv4 cidr specification!'),
              required: true,
            },
          ],
          tip: t('Pod network must not overlap with any host network.'),
        },
        {
          name: 'serviceSubnet',
          label: t('IPv4 Service Subnet'),
          type: 'input',
          rules: [
            {
              pattern: cidrRegex({ exact: true }),
              message: t(
                'The enter does not meet the ipv4 cidr specification!'
              ),
              required: true,
            },
          ],
          tip: t('K8S service subnet'),
        },
        {
          name: 'podIPv6CIDR',
          label: t('Pod V6 Cidr'),
          type: 'input',
          rules: [
            {
              pattern: cidrRegex.v6({ exact: true }),
              message: t('The enter does not meet ipv6 cidr specification!'),
              required: true,
            },
          ],
          hidden: !this.isDualStack,
          tip: t('Pod network must not overlap with any host network.'),
        },
        {
          name: 'pod_network_underlay_v6',
          label: t('Pod V6 Network Underlay'),
          type: 'select',
          required: true,
          options: podNetworkUnderlayOptions,
          hidden: !this.isCalico || !this.isDualStack,
          tip: podNetworkUnderlayOptions.find(
            (it) => it.value === pod_network_underlay_v6
          )?.help,
        },
        {
          name: 'IPv6AutoDetection',
          label: t('IPv6 Autodetection'),
          type: 'input',
          required: true,
          hidden:
            !this.isCalico ||
            !this.isDualStack ||
            pod_network_underlay_v6 === 'first-found',
          ...(underlayInputHelpV6
            ? {
                tip:
                  pod_network_underlay_v6 === 'can-reach'
                    ? t('example: 3001:db0::1, baidu.com or or www.google.com')
                    : underlayInputHelpV6,
              }
            : {}),
          validator: this.checkIpOrDomainV6,
        },
        {
          name: 'serviceSubnetV6',
          label: t('IPv6 Service Subnet'),
          type: 'input',
          rules: [
            {
              pattern: cidrRegex.v6({ exact: true }),
              message: t(
                'The enter does not meet the ipv6 cidr specification!'
              ),
              required: true,
            },
          ],
          tip: t('K8S service v6 subnet'),
          hidden: !this.isDualStack,
        },
        {
          name: 'mtu',
          label: t('MTU'),
          type: 'input-number',
          min: 576,
          max: 1460,
          tip: t(
            'Configure the maximum transmission unit (MTU) for the Calico environment. It is recommended that the maximum transmission unit (MTU) is not greater than 1440, refer: "https://docs.projectcalico.org/networking/mtu"'
          ),
        },
      ],
      [
        {
          name: 'description',
          label: t('Description'),
          type: 'input',
          placeholder: t('Please input description!'),
          maxLength: 256,
        },
        // master 节点浮动ip，前端自己加 label，自己定 key
        {
          name: 'externalIP',
          label: t('External Access IP'),
          type: 'ip-input',
          tip: t('Set up a floating IP for end users to access.'),
          validator: this.checkIP,
        },
        {
          name: 'backupPoint',
          label: t('BackupPoint'),
          type: 'select',
          options: this.getBackupPointOptions,
        },
        {
          name: 'labels',
          label: t('Labels'),
          type: 'array-input',
          itemComponent: KeyValueInput,
          validator: this.checkLabels,
        },
      ],
    ];
  }
}
