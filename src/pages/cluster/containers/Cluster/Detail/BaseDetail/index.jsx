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
import Base from 'containers/BaseDetail';
import { get } from 'lodash';
import { useRootStore } from 'stores';
import { componentStatus } from 'resources/cluster';
import { observer } from 'mobx-react';

function BaseDetail() {
  const { clusterStore: store } = useRootStore();

  const containerRuntimeItem = () => {
    const {
      containerRuntime,
      containerRuntime: { containerRuntimeType: type },
    } = store.detail;

    const isDocker = type === 'docker';

    return [
      {
        label: t('Container Runtime'),
        dataIndex: 'containerRuntime.containerRuntimeType',
      },
      {
        label: isDocker ? t('Docker Version') : t('Containerd Version'),
        dataIndex: 'containerRuntime',
        render: () => containerRuntime[type].version,
      },
      {
        label: t('Docker Data Path'),
        dataIndex: 'containerRuntime.docker',
        render: () => containerRuntime[type].rootDir,
      },
      {
        label: isDocker ? t('Docker Registry') : t('Containerd Registry'),
        dataIndex: 'containerRuntime.docker',
        render: () => containerRuntime[type].insecureRegistry,
      },
    ];
  };

  const networkItem = () => {
    const isDualStack = get(store.detail, 'cni.calico.dualStack');
    return [
      {
        label: t('IP Version'),
        dataIndex: 'cni.calico.dualStack',
        render: (data) => (data ? t('IPv4 IPv6 Dual Stack') : t('IPv4')),
      },
      {
        label: t('Service Subnet'),
        dataIndex: 'networking.serviceSubnet',
      },
      {
        label: t('Pod V4 Cidr'),
        dataIndex: 'cni.podIPv4CIDR',
      },
      {
        label: t('IpV4 Autodetection'),
        dataIndex: 'cni.calico.IPv4AutoDetection',
      },
      ...(isDualStack
        ? [
            {
              label: t('Pod V6 Cidr'),
              dataIndex: 'cni.podIPv6CIDR',
            },
            {
              label: t('IpV6 Autodetection'),
              dataIndex: 'cni.calico.IPv6AutoDetection',
            },
          ]
        : []),
    ];
  };

  const baseInfoCard = () => {
    const options = [
      {
        label: t('Cluster Name'),
        dataIndex: 'name',
      },
      {
        label: t('Kubernetes Version'),
        dataIndex: 'kubernetesVersion',
      },
      {
        label: t('Kubernetes Healthy'),
        dataIndex: 'componentsHealthy',
        render: (data) => {
          const current = data.find((it) => it.name === 'kubernetes');
          return componentStatus[current?.status];
        },
      },
      {
        label: t('LocalRegistry'),
        dataIndex: 'offline',
        render: (_, data) => {
          const { offline, localRegistry = '' } = data;
          return offline ? `${t('Offline')} ${localRegistry}` : t('Online');
        },
      },
      {
        label: t('Description'),
        dataIndex: 'description',
      },
      {
        label: t('BackupPoint'),
        dataIndex: 'backupPoint',
      },
      {
        label: t('ETCD Data Dir'),
        dataIndex: 'kubeComponents.etcd.dataDir',
      },
      {
        label: t('CertSANs'),
        dataIndex: 'certSANs',
      },
      ...containerRuntimeItem(),
      {
        label: t('External Access IP'),
        dataIndex: 'externalIP',
      },
      {
        label: t('Master Node'),
        dataIndex: 'mastersByIp',
        render: (data) => (
          <>
            {data.map(({ ip }, index) => (
              <p key={index}>{ip}</p>
            ))}
          </>
        ),
      },

      {
        label: t('Cluster Labels'),
        dataIndex: '_originData',
        render: (data) => {
          const labels = get(data, 'metadata.labels');
          if (labels) {
            const labelArray = Object.entries(labels).map(
              ([key, value]) => `${key}:${value}`
            );

            return labelArray;
          }

          return 11;
        },
      },
    ];
    return {
      title: t('Base Info'),
      options,
    };
  };

  const networkCard = () => {
    const options = [
      {
        label: t('DNS Domain'),
        dataIndex: 'networking.dnsDomain',
      },
      {
        label: t('WorkerNode Vip'),
        dataIndex: '_originData.workerNodeVip',
      },
      {
        label: t('CNI Type'),
        dataIndex: 'cni.type',
      },
      {
        label: t('Network Plugin Version'),
        dataIndex: 'cni.calico.version',
      },
      {
        label: t('Enable Ipvs'),
        dataIndex: 'kubeProxy.ipvs',
        valueRender: 'yesNo',
      },
      {
        label: t('IPManger'),
        dataIndex: 'cni.calico.IPManger',
        valueRender: 'yesNo',
      },
      {
        label: t('Calico Mode'),
        dataIndex: 'cni.calico.mode',
      },
      ...networkItem(),
      {
        label: t('MTU'),
        dataIndex: 'cni.mtu',
      },
    ];
    return {
      title: t('Network Info'),
      options,
    };
  };

  const currentProps = {
    cards: [baseInfoCard(), networkCard()],
    store,
  };

  return <Base {...currentProps} />;
}

export default observer(BaseDetail);
