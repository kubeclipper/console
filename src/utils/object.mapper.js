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

import { get, omit, merge, intersectionBy, has } from 'lodash';
import { status as nodeStatus } from 'resources/node';
import { formatRoleRules, safeParseJSON } from 'utils';
import { INTERNAL_ROLE_DES } from 'utils/constants';
import UAParser from 'ua-parser-js';
import { computeAutoDetectionReversion } from 'resources/common';
/**
 * 原始数据
 * @param {*} item
 * @returns
 */
const getOriginData = (item) =>
  omit(item, [
    'metadata.uid',
    'metadata.selfLink',
    'metadata.generation',
    'metadata.ownerReferences',
    'metadata.resourceVersion',
    'metadata.creationTimestamp',
    'metadata.managedFields',
  ]);

/**
 *  公共基本信息
 * @param {*} item
 * @returns
 */
const getBaseInfo = (item) => ({
  id: get(item, 'metadata.name'),
  name: get(item, 'metadata.name'),
  createTime: get(item, 'metadata.creationTimestamp'),
  resourceVersion: get(item, 'metadata.resourceVersion'),
});

/**
 * 节点
 * @param {*} item
 * @returns
 */
const NodesMapper = (item) => {
  const conditions = get(item, 'status.conditions');

  const { status: key } = conditions.find((it) => it.type === 'Ready');
  const belongToCluster = get(
    item,
    'metadata.labels["kubeclipper.io/cluster"]'
  );

  return {
    ...getBaseInfo(item),
    ip: get(item, 'status.ipv4DefaultIP'),
    hostname: get(item, 'metadata.labels["kubeclipper.io/hostname"]'),
    role: get(item, 'metadata.labels["kubeclipper.io/nodeRole"]', '-'),
    cpu: get(item, 'status.capacity.cpu'),
    memory: get(item, 'status.capacity.memory'),
    storage: get(item, 'status.capacity.storage'),
    status: nodeStatus[key] || key,
    region: get(item, 'metadata.labels["topology.kubeclipper.io/region"]'),
    belongToCluster,
    ipv4DefaultGw: get(item, 'status.ipv4DefaultGw'),
    nodeInfo: get(item, 'status.nodeInfo'),
    disabled: !get(item, 'metadata.labels["kubeclipper.io/nodeDisable"]'),
    _originData: getOriginData(item),
  };
};

/**
 * 筛选 components
 * @param {*} array
 * @param {*} filters
 * @returns
 */
function filterComponents(array, filters) {
  return array?.filter((a) => filters.some((b) => a.name === b));
}

/**
 * 集群
 * @param {*} item
 * @returns
 */
const ClusterMapper = (item) => {
  const { metadata, networking } = item;
  const STORAGES = ['nfs-provisioner', 'ceph-csi', 'cinder'];
  const PLUGINS = ['kubesphere'];

  const components = Object.fromEntries(
    item.addons?.map((c) => [c.name, c.config]) || []
  );
  const { masters, workers = [], nodes = [] } = item;
  const mastersByIp = intersectionBy(nodes, masters, 'id');
  const offline = has(metadata.annotations, 'kubeclipper.io/offline');
  const isDualStack = get(networking, 'ipFamily') === 'IPv4+IPv6';
  const [podIPv4CIDR, podIPv6CIDR] = get(networking, 'pods.cidrBlocks');
  const [serviceSubnet, serviceSubnetV6] = get(
    networking,
    'services.cidrBlocks'
  );

  const licenseExpirationTime = get(item, 'status.certifications', []).find(
    (_item) => _item.caName
  )?.expirationTime;

  return {
    ...getBaseInfo(item),
    ...item,
    ...components,
    licenseExpirationTime,
    nodeList: [...masters, ...workers],
    mastersByIp,
    offline,
    isDualStack,
    podIPv4CIDR,
    podIPv6CIDR,
    serviceSubnet,
    serviceSubnetV6,
    externalIP: get(metadata, 'labels["kubeclipper.io/externalIP"]'),
    status: get(item, 'status.phase'),
    componentsHealthy: get(item, 'status.componentConditions') || [],
    plugin: filterComponents(item.addons, PLUGINS) || [],
    storage: filterComponents(item.addons, STORAGES) || [],
    region: get(metadata, 'labels["topology.kubeclipper.io/region"]'),
    description: get(metadata, 'annotations["kubeclipper.io/description"]'),
    backupPoint: get(metadata, 'labels["kubeclipper.io/backupPoint"]'),
    _originData: getOriginData(item),
  };
};

const ClusterTemplateMapper = (item) => {
  const { config } = item;
  const IPv4AutoDetection = get(config, 'cni.calico.IPv4AutoDetection');
  const IPv6AutoDetection = get(config, 'cni.calico.IPv6AutoDetection');
  const podNetwork = computeAutoDetectionReversion({
    IPv4AutoDetection,
    IPv6AutoDetection,
  });
  const [podIPv4CIDR, podIPv6CIDR] = get(config, 'networking.pods.cidrBlocks');
  const [serviceSubnet, serviceSubnetV6] = get(
    config,
    'networking.services.cidrBlocks'
  );
  const isDualStack = get(config, 'networking.ipFamily') === 'IPv4+IPv6';

  const offline = has(config.metadata, 'annotations["kubeclipper.io/offline"]');
  const description = get(
    config.metadata,
    'annotations["kubeclipper.io/description"]'
  );
  const externalIP = get(
    config.metadata,
    'labels["kubeclipper.io/externalIP"]'
  );
  const backupPoint = get(
    config.metadata,
    'labels["kubeclipper.io/backupPoint"]'
  );

  const kubernetesVersion = get(config, 'kubernetesVersion');

  const containerRuntimeVersion = get(config, 'containerRuntime.version');
  const containerRuntimeType = get(config, 'containerRuntime.type');

  return {
    offline,
    description,
    externalIP,
    backupPoint,
    certSANs: get(config, 'certSANs'),
    localRegistry: get(config, 'localRegistry'),
    workerNodeVip: get(config, 'workerNodeVip'),
    kubernetesVersion,
    containerRuntimeType,
    [`${containerRuntimeType}Version`]: containerRuntimeVersion,
    [`${containerRuntimeType}RootDir`]: get(config, 'containerRuntime.rootDir'),
    [`${containerRuntimeType}InsecureRegistry`]: get(
      config,
      'containerRuntime.insecureRegistry',
      []
    )
      .filter((val) => !!val)
      .map((val, index) => ({
        value: val,
        index,
      })),
    // networking
    podIPv4CIDR,
    podIPv6CIDR,
    serviceSubnet,
    serviceSubnetV6,
    isDualStack,
    IPVersion: get(config, 'networking.ipFamily'),
    dnsDomain: get(config, 'networking.dnsDomain'),
    podSubnet: get(config, 'networking.podSubnet'),
    proxyMode: get(config, 'networking.proxyMode'),
    // etcd
    etcdDataDir: get(config, 'etcd.dataDir'),
    // kubectl
    kubectlDataDir: get(config, 'kubelet.rootDir'),
    // cni
    cniType: get(config, 'cni.type'),
    calicoVersion: get(config, 'cni.version'),
    mtu: get(config, 'cni.calico.mtu'),
    IPv4AutoDetection: get(config, 'cni.calico.IPv4AutoDetection'),
    IPv6AutoDetection: get(config, 'cni.calico.IPv6AutoDetection'),
    calicoMode: get(config, 'cni.calico.mode'),
    IPManger: get(config, 'cni.calico.IPManger'),
    availableComponents: get(config, 'addons'),
    ...podNetwork,
    _originData: item,
  };
};

/**
 * 操作记录
 * @param {*} item
 * @returns
 */
const OperationMapper = (item) => {
  const conditions = get(item, 'status.conditions') || [];
  const steps = get(item, 'steps');

  const operationSteps = merge(conditions, steps);

  return {
    ...getBaseInfo(item),
    operationSteps,
    status: get(item, 'status.status'),
    operationName: get(item, 'metadata.labels["kubeclipper.io/operation"]'),
  };
};

/**
 * 区域
 * @param {*} item
 * @returns
 */
const RegionMapper = (item) => ({
  ...getBaseInfo(item),
  _originData: getOriginData(item),
});

/**
 * 用户
 * @param {*} item
 * @returns
 */
const UserMapper = (item) => ({
  ...getBaseInfo(item),
  role: get(item, 'metadata.annotations["iam.kubeclipper.io/role"]'),
  authenticationMode: get(item, 'metadata.labels["iam.kubeclipper.io/idp"]'),
  description: get(item, 'spec.description'),
  displayName: get(item, 'spec.displayName'),
  phone: get(item, 'spec.phone'),
  email: get(item, 'spec.email'),
  status: get(item, 'status.state'),
  _originData: getOriginData(item),
});

/**
 * 角色
 * @param {*} item
 * @returns
 */
const RoleMapper = (item) => {
  const isInternal = safeParseJSON(
    get(item, 'metadata.annotations["kubeclipper.io/internal"]'),
    false
  );

  const description = isInternal
    ? INTERNAL_ROLE_DES[get(item, 'metadata.name')]
    : get(item, 'metadata.annotations["kubeclipper.io/description"]', '');

  return {
    ...getBaseInfo(item),
    rules: formatRoleRules(item),
    // rules: get(item, 'rules'),
    aliasName: get(item, 'metadata.annotations["kubeclipper.io/alias-name"]'),
    module: get(item, 'metadata.annotations["kubeclipper.io/module"]'),
    labels: get(item, 'metadata.labels', {}),
    annotations: get(item, 'metadata.annotations'),
    dependencies: safeParseJSON(
      get(item, 'metadata.annotations["kubeclipper.io/dependencies"]', ''),
      []
    ),
    roleTemplates: safeParseJSON(
      get(item, 'metadata.annotations["kubeclipper.io/aggregation-roles"]', ''),
      []
    ),
    description,
    isInternal,
    _originData: getOriginData(item),
  };
};

/**
 * 登录日志
 * @param {*} item
 * @returns
 */
const LoginLogMapper = (item) => {
  const uaData = UAParser(get(item, 'spec.userAgent'));
  return {
    ...getBaseInfo(item),
    type: get(item, 'kind'),
    clientId: uaData.os.name || uaData.ua,
    userName: get(item, 'metadata.labels["iam.kubeclipper.io/user-ref"]'),
    ip: get(item, 'spec.sourceIP'),
    status: get(item, 'spec.success') ? 'success' : 'failed',
    _originData: getOriginData(item),
  };
};

/**
 * 备份
 * @param {*} item
 */
const BackUpMapper = (item) => ({
  ...item,
  ...getBaseInfo(item),
  status: get(item, 'backupStatus.status'),
  kubernetesVersion: get(item, 'backupStatus.kubernetesVersion'),
  description: get(item, 'metadata.annotations["kubeclipper.io/description"]'),
  cluster: get(item, 'metadata.labels["kubeclipper.io/cluster"]'),
  _originData: getOriginData(item),
});

/**
 * 审计日志
 * @param {*} item
 * @returns
 */
const AuditMapper = (item) => {
  const uaData = UAParser(get(item, 'userAgent'));
  return {
    ...getBaseInfo(item),
    type: get(item, 'type'),
    clientId: uaData.os.name || uaData.ua,
    username: get(item, 'username'),
    ip: get(item, 'sourceIP'),
    status: get(item, 'success') ? 'success' : 'failed',
    verb: get(item, 'verb'),
    resourceId: get(item, 'resourceName'),
    resource: get(item, 'resource'),
    requestURI: get(item, 'requestURI'),
  };
};

const DnsMapper = (item) => ({
  ...getBaseInfo(item),
  description: get(item, 'spec.description'),
  records: get(item, 'spec.records'),
  recordCounts: Object.keys(get(item, 'spec.records') || {}).length,
  syncCluster: get(item, 'spec.syncCluster') || [],
  _originData: getOriginData(item),
});

const Oauth2Mapper = (data) => {
  let identityProviders = get(data, 'identityProviders') || [];

  identityProviders = identityProviders.map((item) => {
    const { provider = {} } = item;
    const { endpoint = {} } = provider;

    return {
      ...item,
      ...provider,
      ...endpoint,
    };
  });

  return {
    ...data,
    identityProviders,
  };
};

const BackupPointMapper = (item) => {
  const storageType = get(item, 'storageType');
  const config = get(item, `${storageType.toLowerCase()}Config`);
  return {
    ...getBaseInfo(item),
    ...config,
    storageType,
  };
};

const TemplatesMapper = (item) => {
  const { metadata } = item;
  const componentName = get(metadata, 'labels["kubeclipper.io/componentName"]');
  let flatData = {};

  if (componentName === 'kubernetes') {
    flatData = ClusterTemplateMapper(item);
  } else {
    flatData = get(item, 'config');
  }

  const name = get(metadata, 'annotations["kubeclipper.io/display-name"]');

  return {
    ...getBaseInfo(item),
    name,
    templateName: name,
    templateDescription: get(
      metadata,
      'annotations["kubeclipper.io/description"]'
    ),
    pluginName: get(metadata, 'labels["kubeclipper.io/componentName"]'),
    pluginVersion: get(metadata, 'labels["kubeclipper.io/componentVersion"]'),
    pluginCategory: get(metadata, 'labels["kubeclipper.io/category"]'),
    flatData,
    _originData: item,
  };
};

const CronBackupMapper = (item) => {
  const type = get(item, 'spec.schedule') ? 'Repeat' : 'OnlyOnce';
  return {
    ...getBaseInfo(item),
    ...get(item, 'spec'),
    type,
    enabled: has(item.metadata.labels, 'kubeclipper.io/cronBackupEnable'),
    _originData: item,
  };
};

export default {
  nodes: NodesMapper,
  clusters: ClusterMapper,
  operations: OperationMapper,
  regions: RegionMapper,
  users: UserMapper,
  roles: RoleMapper,
  loginLog: LoginLogMapper,
  backups: BackUpMapper,
  events: AuditMapper,
  dns: DnsMapper,
  oauth2: Oauth2Mapper,
  backupPoints: BackupPointMapper,
  cronBackups: CronBackupMapper,
  templates: TemplatesMapper,
  clusterTemplate: ClusterTemplateMapper,
};
