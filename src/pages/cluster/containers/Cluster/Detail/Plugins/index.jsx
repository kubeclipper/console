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
import { useRootStore } from 'stores';
import { get, isEmpty } from 'lodash';
import { componentStatus } from 'resources/cluster';
import ActionButton from 'components/Tables/Base/ActionButton';
import Delete from './actions/RemovePlugin';
import SaveAsTemplate from '../../actions/SaveAsTemplate';
import { getAction } from 'utils/allowed';
import { toJS } from 'mobx';
import { useParams } from 'react-router';
import { checkExpired, isDisableByProviderType } from 'utils';

function Plugins() {
  const { clusterStore: store, components } = useRootStore();
  const { id } = useParams();

  const plugin = toJS(get(store.detail, 'plugin'));
  const kubesphere = plugin.filter((item) => item.name === 'kubesphere');
  const metallb = plugin.filter((item) => item.name === 'metallb');

  const KSCard = kubesphere.map((item) => {
    const { config } = item;
    const options = [
      {
        label: t('Access Methods'),
        dataIndex: 'mastersByIp',
        render: (data, { externalIP }) => {
          const { port } = config.console;
          const AccessMethods = [
            {
              title: 'masters',
              datas: data,
            },
          ];

          externalIP &&
            AccessMethods.push({
              title: 'fip',
              datas: [{ ip: externalIP }],
            });

          return (
            <div>
              {AccessMethods.map(({ title, datas }, index) => (
                <div style={{ display: 'flex' }} key={index}>
                  <div style={{ width: '60px' }}>{title}：</div>
                  <div>
                    {datas.map(({ ip }, _index) => {
                      const url = `http://${ip}:${port}`;
                      return (
                        <a
                          style={{ display: 'block' }}
                          // eslint-disable-next-line react/jsx-no-target-blank
                          target="_blank"
                          href={url}
                          key={_index}
                        >
                          {url}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        label: t('Healthy Status'),
        dataIndex: 'componentsHealthy',
        render: (data) => {
          const current = data.find((it) => it.name === 'kubesphere');
          return componentStatus[current?.status];
        },
      },
      {
        label: t('Host Cluster Name'),
        dataIndex: 'kubesphere.HostClusterName',
      },
      {
        label: t('Storage Class'),
        dataIndex: 'kubesphere.storageClass',
      },
      {
        label: t('Cluster Role'),
        dataIndex: 'kubesphere.clusterRole',
      },
      {
        label: t('Cluster Type'),
        dataIndex: 'kubesphere.clusterType',
      },
      {
        label: t('ES'),
        dataIndex: 'kubesphere.es',
        render: () =>
          get(config, 'es') && !isEmpty(config.es)
            ? t('Enabled')
            : t('Not Config'),
      },
      {
        label: t('Monitor'),
        dataIndex: 'kubesphere.monitor',
        render: () =>
          get(config, 'monitor') && !isEmpty(config.monitor)
            ? t('Enabled')
            : t('Not Config'),
      },
      {
        label: t('Alert'),
        dataIndex: 'kubesphere.plugin.enableAlert',
        format: 'Enable',
      },
      {
        label: t('AppStore'),
        dataIndex: 'kubesphere.plugin.enableAppStore',
        format: 'Enable',
      },
      {
        label: t('Audit Log'),
        dataIndex: 'kubesphere.plugin.enableAudit',
        format: 'Enable',
      },
      {
        label: t('Devops'),
        dataIndex: 'kubesphere.plugin.enableDevops',
        format: 'Enable',
      },
      {
        label: t('Event'),
        dataIndex: 'kubesphere.plugin.enableEvent',
        format: 'Enable',
      },
      {
        label: t('Logging'),
        dataIndex: 'kubesphere.plugin.enableLogging',
        format: 'Enable',
      },
      {
        label: t('MetricServer'),
        dataIndex: 'kubesphere.plugin.enableMetricServer',
        format: 'Enable',
      },
      {
        label: t('Network'),
        dataIndex: 'kubesphere.plugin.enableNetwork',
        format: 'Enable',
      },
      {
        label: t('ServiceMesh'),
        dataIndex: 'kubesphere.plugin.enableServiceMesh',
        format: 'Enable',
      },
    ];

    const { version, category, name } = components.find(
      (component) => component.name === item.name
    );

    return {
      title: t('PaaS Platform'),
      options,
      cardButton: () => {
        const saveAsTemplateButtonProps = {
          id: item.name,
          isAllowed: true,
          title: t('Save as template'),
          buttonType: 'link',
          actionType: 'modal',
          item: {
            component: item,
            pluginName: name,
            pluginVersion: version,
            pluginCategory: category,
            isPlugin: true,
          },
        };

        const isLicensExpiration = () =>
          checkExpired(store.detail.licenseExpirationTime);

        const isStatusRunning = () => store.detail.status === 'Running';

        const allowed = () =>
          isLicensExpiration() &&
          isStatusRunning() &&
          !isDisableByProviderType(store.detail);

        const deleteButtonProps = {
          id: item.name,
          isAllowed: allowed(),
          title: t('Remove'),
          buttonType: 'link',
          actionType: 'confirm',
          danger: true,
          item: {
            name: id,
            component: [item],
            uninstall: true,
            title: t('Remove Plugin'),
          },
        };

        const saveAsTemplateAction = getAction(SaveAsTemplate, [], {});
        const deleteAction = getAction(Delete, [], {});

        return (
          <>
            <ActionButton
              {...saveAsTemplateButtonProps}
              action={saveAsTemplateAction}
            />
            <ActionButton {...deleteButtonProps} action={deleteAction} />
          </>
        );
      },
    };
  });

  const LBCard = metallb.map((item, index) => {
    item = toJS(item);
    const options = [];
    const itemKeys = Object.keys(item.config);
    const itemValues = Object.values(item.config);

    for (let i = 0; i < itemKeys.length; i++) {
      options.push({
        label: t(`${itemKeys[i]}`),
        dataIndex: '',
        render: () => `${itemValues[i]}` || '',
      });
    }

    const { version, category, name } = components.find(
      (component) => component.name === item.name
    );

    return {
      title: item.name,
      options,
      cardButton: () => {
        const saveAsTemplateButtonProps = {
          id: `${item.name}-${index}`,
          isAllowed: true,
          title: t('Save as template'),
          buttonType: 'link',
          actionType: 'modal',
          item: {
            component: item.config,
            pluginName: name,
            pluginVersion: version,
            pluginCategory: category,
            isPlugin: true,
          },
        };

        const isLicensExpiration = () =>
          checkExpired(store.detail.licenseExpirationTime);

        const isStatusRunning = () => store.detail.status === 'Running';

        const allowed = () =>
          isLicensExpiration() &&
          isStatusRunning() &&
          !isDisableByProviderType(store.detail);

        const deleteButtonProps = {
          id: `${item.name}-${index}`,
          isAllowed: allowed(),
          title: t('Remove'),
          buttonType: 'link',
          actionType: 'confirm',
          danger: true,
          item: {
            name: id,
            component: [item],
            plugin: toJS(store.detail.plugin),
            uninstall: true,
            title: t('Remove Plugin'),
          },
        };

        const saveAsTemplateAction = getAction(SaveAsTemplate, [], {});
        const deleteAction = getAction(Delete, [], {});

        return (
          <>
            <ActionButton
              {...saveAsTemplateButtonProps}
              action={saveAsTemplateAction}
            />
            <ActionButton {...deleteButtonProps} action={deleteAction} />
          </>
        );
      },
    };
  });

  const currentProps = {
    cards: [...KSCard, ...LBCard],
    store,
  };

  return <Base {...currentProps} />;
}

export default Plugins;
