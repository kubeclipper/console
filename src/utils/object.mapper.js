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

import { get, omit, merge, intersectionBy } from 'lodash';
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
  const STORAGES = ['nfs-provisioner', 'ceph-csi', 'cinder'];
  const PLUGINS = ['kubesphere'];

  const ITEM = item[item.type];

  const components = Object.fromEntries(
    ITEM.components?.map((c) => [c.name, c.config]) || []
  );

  const kubeComponents = get(ITEM, 'kubeComponents') || {};
  const { masters, workers = [], nodes = [] } = ITEM;
  const mastersByIp = intersectionBy(nodes, masters, 'id');
  const result = {
    ...getBaseInfo(item),
    ...item,
    ...ITEM,
    ...components,
    nodeList: [...masters, ...workers],
    mastersByIp,
    externalIP: get(item, 'metadata.labels["kubeclipper.io/externalIP"]'),
    kubeComponents,
    cni: kubeComponents.cni,
    kubeProxy: kubeComponents.kubeProxy,
    status: get(item, 'status.status'),
    componentsHealthy: get(item, 'status.componentConditions') || [],
    plugin: filterComponents(ITEM.components, PLUGINS) || [],
    storage: filterComponents(ITEM.components, STORAGES) || [],
    region: get(item, 'metadata.labels["topology.kubeclipper.io/region"]'),
    description: get(
      item,
      'metadata.annotations["kubeclipper.io/description"]'
    ),
    backupPoint: get(item, 'metadata.labels["kubeclipper.io/backupPoint"]'),
    _originData: getOriginData(item),
  };
  return result;
};

const ClusterTemplateMapper = (item) => {
  const { config } = item;
  const IPv4AutoDetection = get(
    config,
    'kubeComponents.cni.calico.IPv4AutoDetection'
  );
  const IPv6AutoDetection = get(
    config,
    'kubeComponents.cni.calico.IPv6AutoDetection'
  );
  const podNetwork = computeAutoDetectionReversion({
    IPv4AutoDetection,
    IPv6AutoDetection,
  });

  const offline = get(config, 'offline');
  const kubernetesVersion = get(config, 'kubernetesVersion');
  const kubernetesVersionOnline = !offline && kubernetesVersion;
  const kubernetesVersionOffline = offline && kubernetesVersion;

  const containerdVersion = get(config, 'containerRuntime.containerd.version');
  const containerdVersionOnline = !offline && containerdVersion;
  const containerdVersionOffline = offline && containerdVersion;

  const result = {
    offline,
    certSANs: get(config, 'certSANs'),
    localRegistry: get(config, 'localRegistry'),
    workerNodeVip: get(config, 'workerNodeVip'),
    kubernetesVersion,
    kubernetesVersionOnline,
    kubernetesVersionOffline,
    containerRuntimeType: get(config, 'containerRuntime.containerRuntimeType'),
    dockerVersion: get(config, 'containerRuntime.docker.dockerVersion'),
    dockerInsecureRegistry: get(
      config,
      'containerRuntime.docker.insecureRegistry'
    ),
    dockerRootDir: get(config, 'containerRuntime.docker.rootDir'),
    containerdVersion,
    containerdVersionOnline,
    containerdVersionOffline,
    containerdInsecureRegistry: get(
      config,
      'containerRuntime.containerd.insecureRegistry',
      []
    ).filter((val) => !!val),
    containerdRootDir: get(config, 'containerRuntime.containerd.rootDir'),
    // networking
    serviceSubnet: get(config, 'networking.serviceSubnet'),
    dnsDomain: get(config, 'networking.dnsDomain'),
    podSubnet: get(config, 'networking.podSubnet'),
    // kubeComponents
    ipvs: get(config, 'kubeComponents.kubeProxy.ipvs'),
    etcdDataDir: get(config, 'kubeComponents.etcd.dataDir'),
    cniType: get(config, 'kubeComponents.cni.type'),
    podIPv4CIDR: get(config, 'kubeComponents.cni.podIPv4CIDR'),
    podIPv6CIDR: get(config, 'kubeComponents.cni.podIPv6CIDR'),
    mtu: get(config, 'kubeComponents.cni.mtu'),
    IPv4AutoDetection,
    IPv6AutoDetection,
    calicoMode: get(config, 'kubeComponents.cni.calico.mode'),
    dualStack: get(config, 'kubeComponents.cni.calico.dualStack'),
    IPManger: get(config, 'kubeComponents.cni.calico.IPManger'),
    availableComponents: get(config, 'components'),
    ...podNetwork,
  };

  return result;
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
  const componentName = get(
    item,
    'metadata.labels["kubeclipper.io/componentName"]'
  );
  let flatData = {};
  if (componentName === 'kubernetes') {
    flatData = ClusterTemplateMapper(item);
  } else {
    flatData = get(item, 'config');
  }
  const name = get(item, 'metadata.annotations["kubeclipper.io/display-name"]');
  const result = {
    ...getBaseInfo(item),
    name,
    templateName: name,
    templateDescription: get(
      item,
      'metadata.annotations["kubeclipper.io/description"]'
    ),
    pluginName: get(item, 'metadata.labels["kubeclipper.io/componentName"]'),
    pluginVersion: get(
      item,
      'metadata.labels["kubeclipper.io/componentVersion"]'
    ),
    pluginCategory: get(item, 'metadata.labels["kubeclipper.io/category"]'),
    flatData,
    _originData: item,
  };
  return result;
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
  templates: TemplatesMapper,
  clusterTemplate: ClusterTemplateMapper,
};
