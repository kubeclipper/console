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
import { Link } from 'react-router-dom';
import { getRoles, nodeEnum } from 'resources/node';
import RenderOption from 'components/RenderOption';
import { Tag } from 'antd';
import { checkExpired } from 'utils';
import moment from 'moment';

export const clusterParams = {
  offline: true,
  localRegistry: '',
  etcdDataDir: '/var/lib/etcd',
  kubectlDataDir: '/var/lib/kubelet',
  containerRuntimeType: 'containerd',
  dockerRootDir: '/var/lib/docker',
  containerdRootDir: '/var/lib/containerd',
  // 网络
  dnsDomain: 'cluster.local',
  workerNodeVip: '169.254.169.100',
  cniType: 'calico',
  calicoMode: 'Overlay-Vxlan-All',
  IPVersion: 'IPv4',
  proxyMode: 'ipvs',
  IPManger: true,
  podIPv4CIDR: '172.25.0.0/24',
  podIPv6CIDR: 'fd05::/120',
  pod_network_underlay: 'first-found',
  pod_network_underlay_v6: 'first-found',
  mtu: 1440,
  serviceSubnet: '10.96.0.0/16',
  serviceSubnetV6: 'fd03::/112',
};

export const isMaster = (role) => {
  if (getRoles(role).includes('master')) return true;

  return false;
};

export const transitionStatus = [
  'Installing',
  'Updating',
  'Upgrading',
  'BackingUp',
  'Restoring',
  'Terminating',
  'Removing',
];

export const failedStatus = [
  'InstallFailed',
  'UpdateFailed',
  'UpgradeFailed',
  'RestoreFailed',
  'TerminateFailed',
  'RemoveFailed',
];

export const clusterStatus = [
  'Running',
  ...transitionStatus,
  ...failedStatus,
].reduce((pre, current) => ({ ...pre, [current]: t(current) }), {});

export const componentStatus = {
  Healthy: t('Healthy'),
  Unhealthy: t('Unhealthy'),
  Unknown: t('Unknown'),
  Unsupported: t('Unsupported'),
};

export const operationStatus = {
  running: t('Ongoing'),
  successful: t('Successful'),
  failed: t('Failed'),
  unknown: t('Unknown'),
};

export const reclaimPolicyOption = [
  {
    label: t('Retain'),
    value: 'Retain',
  },
  {
    label: t('Delete'),
    value: 'Delete',
  },
];

export const containerRuntimeOption = [
  {
    label: t('Docker'),
    value: 'docker',
  },
  {
    label: t('Containerd'),
    value: 'containerd',
  },
];

export const networkPluginOption = [
  {
    label: t('Calico'),
    value: 'calico',
  },
];

const calicoMode = [
  {
    value: 'Overlay-IPIP-All',
    des: t(
      'A pod network in overlay mode using IP-in-IP technology, suitable for environments where all underlying platforms support IPIP'
    ),
  },
  {
    value: 'Overlay-Vxlan-All',
    des: t(
      'The overlay mode pod network using vxlan technology is suitable for almost all platforms but the performance is reduced'
    ),
  },
  {
    value: 'BGP',
    des: t(
      'Using the pod network in BGP mode, the pod network can be easily connected to the physical network with the best performance. It is suitable for bare metal environments and network environments that support the BGP protocol.'
    ),
  },
  {
    value: 'Overlay-IPIP-Cross-Subnet',
    des: t(
      'Use the overlay mode pod network of IP-in-IP technology when communicating on different network segments, host routing when communicating on the same network segment, suitable for bare metal environments with complex network environments'
    ),
  },
  {
    value: 'Overlay-Vxlan-Cross-Subnet',
    des: t(
      'Use the overlay mode pod network of vxlan technology when communicating on different network segments, and host routing when communicating on the same network segment, suitable for bare metal environments with complex network environments'
    ),
  },
];

export const calicoModeOption = calicoMode.map(({ value, des }) => ({
  label: <RenderOption label={value} description={des} />,
  value,
}));

export const podNetworkUnderlayOptions = [
  {
    label: t('first-found'),
    value: 'first-found',
    help: t(
      'Enumerates all interface IP addresses and returns the first valid IP address as router ip(based on IP version and type of address.'
    ),
  },
  {
    label: t('can-reach'),
    value: 'can-reach',
    help: t(
      'The can-reach method uses your local routing to determine which IP address will be used to reach the supplied destination. Both IP addresses and domain names may be used.'
    ),
  },
  {
    label: t('interface'),
    value: 'interface',
    help: t(
      'The interface method uses the supplied interface regular expression (golang syntax) to enumerate matching interfaces and to return the first IP address on the first matching interface. The order that both the interfaces and the IP addresses are listed is system dependent.'
    ),
  },
];

export const inputHelpByUnderlayType = {
  'can-reach': t('example: 10.0.0.1，baidu.com or www.google.com'),
  interface: t('example: eth0 or eth.*'),
  cidr: t('example: eth0 or eth.*'),
};

/**
 *
 * @param {*} components
 * @returns
 */
export const formatComponents = (data, components) => {
  const _components = data
    .map(({ name, version }) => {
      const item = components.find((it) => it.name === name) ?? {};

      const formData = {
        enabled: item.enabled,
        ...item.formData,
      };

      return {
        name,
        version,
        config: formData,
      };
    })
    .filter((item) => item.config.enabled);

  return _components;
};

/**
 *
 * @param {*} nodes
 * @returns
 */
export const formatNodes = (nodes) => {
  const obj = {};
  nodeEnum.forEach((key) => {
    const node = nodes.find((v) => v.key === key);

    if (node) {
      const { value = [] } = node;
      obj[key] = (value || []).map((v) => ({ id: v.id }));
    }
  });

  return obj;
};

/**
 * 1. pod_network_underlay 类型 是 first-found， IPv4AutoDetection 值就取 first-found
 * 2. pod_network_underlay 类型为其他时，IPv4AutoDetection 值用 `${pod_network_underlay}=${ip_autodetection}`
 * 3. IPv6AutoDetection 同理，并且 dualStack 开启才有该参数
 * @param {*} values
 * @returns obj
 */
export const computeAutoDetection = (values) => {
  const {
    IPVersion,
    pod_network_underlay,
    pod_network_underlay_v6,
    IPv4AutoDetection: v4,
    IPv6AutoDetection: v6,
  } = values;

  const dualStack = IPVersion === 'IPv4+IPv6';

  function ipAutoDetection(underlay, ip) {
    if (underlay === 'first-found') return 'first-found';

    return `${underlay}=${ip}`;
  }

  return {
    IPv4AutoDetection: ipAutoDetection(pod_network_underlay, v4),
    IPv6AutoDetection: dualStack
      ? ipAutoDetection(pod_network_underlay_v6, v6)
      : '',
  };
};

export const columns = [
  {
    title: t('Name'),
    dataIndex: 'name',
    isHideable: true,
    copyable: true,
    render: (name) => <Link to={`/cluster/${name}`}>{name}</Link>,
    extraRender: (name, data) => {
      let isExpired = null;
      if (data.licenseExpirationTime) {
        const date = moment(data.licenseExpirationTime)
          .subtract(1, 'day')
          .format('YYYY-MM-DD HH:mm:ss');
        isExpired = !checkExpired(date);
      }

      return (
        <>
          {isExpired ? (
            <Tag style={{ marginLeft: '12px' }} color={'red'} key={name}>
              {t('License Expiration')}
            </Tag>
          ) : null}
        </>
      );
    },
  },
  {
    title: t('Region'),
    dataIndex: 'region',
    isHideable: true,
  },
  {
    title: t('Description'),
    dataIndex: 'description',
    isHideable: true,
    render: (description) => (
      <div style={{ minWidth: '26px' }}>{description}</div>
    ),
  },
  {
    title: t('Master Node'),
    dataIndex: 'masters',
    isHideable: true,
    width: 80,
    render: (data) => (data ? data.length : '-'),
  },
  {
    title: t('Worker Node'),
    dataIndex: 'workers',
    isHideable: true,
    width: 80,
    render: (data) => (data ? data.length : '-'),
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    isHideable: true,
    render: (data) => clusterStatus[data] || data,
  },
  {
    title: t('Create Time'),
    dataIndex: 'createTime',
    valueRender: 'toLocalTime',
  },
];

export const IPVersionOptions = [
  {
    label: 'IPv4',
    value: 'IPv4',
  },
  {
    label: t('IPv4 IPv6 Dual Stack'),
    value: 'IPv4+IPv6',
  },
];

export const proxyModeOptions = [
  {
    label: 'ipvs',
    value: 'ipvs',
  },
  {
    label: 'iptables',
    value: 'iptables',
  },
  {
    label: 'ebpf',
    value: 'ebpf',
  },
];
