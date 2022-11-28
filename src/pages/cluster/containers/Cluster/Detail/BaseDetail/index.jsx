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
import { get, uniq } from 'lodash';
import { observer } from 'mobx-react';
import { useRootStore } from 'stores';
import { isDisableByProviderType } from 'utils';

function BaseDetail() {
  const { clusterStore: store } = useRootStore();

  const containerRuntimeItem = () => [
    {
      label: t('Container Runtime'),
      dataIndex: 'containerRuntime',
      render: (data) => `${data.type} ${data.version}`,
    },
    {
      label: t('Docker Data Path'),
      dataIndex: 'containerRuntime',
      render: (data) => data.rootDir,
    },
    {
      label: t('Container Registry'),
      dataIndex: 'containerRuntime',
      render: (_, record) => {
        const registry = get(record, '_originData.status.Registries') ?? [];
        if (registry.length === 0) return '-';
        return uniq(registry.map((it) => it.host));
      },
    },
  ];

  const networkItem = () => [
    {
      label: t('IP Version'),
      dataIndex: 'isDualStack',
      render: (data) => (data ? t('IPv4 IPv6 Dual Stack') : t('IPv4')),
    },
    {
      label: t('Service Subnet'),
      dataIndex: 'serviceSubnet',
    },
    {
      label: t('Pod V4 Cidr'),
      dataIndex: 'podIPv4CIDR',
    },
    {
      label: t('IpV4 Autodetection'),
      dataIndex: 'cni.calico.IPv4AutoDetection',
    },
    ...(store.detail.isDualStack
      ? [
          {
            label: t('Pod V6 Cidr'),
            dataIndex: 'podIPv6CIDR',
          },
          {
            label: t('IpV6 Autodetection'),
            dataIndex: 'cni.calico.IPv6AutoDetection',
          },
        ]
      : []),
  ];

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
        label: t('LocalRegistry'),
        dataIndex: 'offline',
        render: (_, data) => {
          const { offline, localRegistry = '' } = data;
          return `${offline ? t('Offline') : t('Online')} ${localRegistry}`;
        },
      },
      {
        label: t('Description'),
        dataIndex: 'description',
      },
      {
        label: t('Backup Space'),
        dataIndex: 'backupPoint',
      },
      {
        label: t('{name} Data Dir', { name: 'ETCD' }),
        dataIndex: 'etcd.dataDir',
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
        label: t('Master'),
        dataIndex: 'controlPlaneHealth',
        render: (data) => {
          const isRancher = isDisableByProviderType(store.detail);
          return (
            <>
              {data.map(({ hostname, address, status }, index) => (
                <p key={index}>
                  {hostname} | {address} {!isRancher ? `｜ ${t(status)}` : ''}
                </p>
              ))}
            </>
          );
        },
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
      {
        label: t('License Expiration Time'),
        dataIndex: 'licenseExpirationTime',
        valueRender: 'toLocalTime',
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
        dataIndex: 'networking.workerNodeVip',
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
        dataIndex: 'cni.calico.mtu',
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
