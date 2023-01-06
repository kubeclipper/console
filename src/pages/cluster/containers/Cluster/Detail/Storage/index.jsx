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
import { componentStatus } from 'resources/cluster';
import ActionButton from 'components/Tables/Base/ActionButton';
import Delete from './actions/RemovePlugin';
import SaveAsTemplate from '../../actions/SaveAsTemplate';
import { getAction } from 'utils/allowed';
import { toJS } from 'mobx';
import { useParams } from 'react-router';
import { checkExpired, isDisableByProviderType } from 'utils';

export default function Storage() {
  const { clusterStore: store, components } = useRootStore();
  const { id } = useParams();

  const cards = store.detail.storage.map((item, index) => {
    item = toJS(item);
    let options = [];
    const itemKeys = Object.keys(item.config);
    const itemValues = Object.values(item.config);

    for (let i = 0; i < itemKeys.length; i++) {
      options.push({
        label: t(`${itemKeys[i]}`),
        dataIndex: '',
        render: () => `${itemValues[i]}` || '',
      });
    }

    const customOption = [
      {
        label: t('Healthy Status'),
        dataIndex: 'componentsHealthy',
        render: (data) => {
          const current = data.find((it) => it.name === item.config.scName);
          return componentStatus[current?.status];
        },
      },
    ];

    options = [...options, ...customOption];

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
            title: t('Remove Storage'),
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
    cards,
    store,
  };

  return <Base {...currentProps} />;
}
