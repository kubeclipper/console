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
import BaseList from 'containers/List';
import actionConfigs from './actions';
import { useRootStore } from 'stores';
import styles from './index.less';

function BackupPoint(props) {
  const { backupPointStore } = useRootStore();

  const columns = [
    {
      title: t('Name'),
      dataIndex: 'name',
    },
    {
      title: t('Type'),
      dataIndex: 'storageType',
    },
    {
      title: t('Description'),
      dataIndex: 'description',
    },
    {
      title: t('Create Time'),
      dataIndex: 'createTime',
      valueRender: 'toLocalTime',
    },
  ];

  const currentProps = {
    ...props,
    name: t('Backup Space'),
    store: backupPointStore,
    actionConfigs,
    columns,
    propsParams: {
      labelSelector: '!kubeclipper.io/role-template',
    },
    searchFilters: [
      {
        label: t('Name'),
        name: 'name',
      },
    ],
    isShowDownLoadIcon: false,
    isShowEyeIcon: false,
    isRenderFooter: false,
    expandable: () => ({
      expandedRowRender: (record) => {
        const data = [
          {
            title: 'backupRootDir',
          },
          { title: 'bucket' },
          {
            title: 'accessKeyID',
          },
          {
            title: 'accessKeySecret',
          },
          {
            title: 'endpoint',
          },
          {
            title: 'region',
          },
          {
            title: 'ssl',
          },
        ];

        const visibleDatas = data
          .map((item) => {
            if (record[item.title]) {
              return {
                key: item.title,
                value: record[item.title],
              };
            }
            return null;
          })
          .filter((item) => !!item);

        return (
          <div className={styles.info}>
            {visibleDatas.map(({ key, value }, index) => (
              <div className={styles.info_item} key={index}>
                <span>{t(`${key}`)}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        );
      },
      rowExpandable: () => true,
    }),
  };

  return <BaseList {...currentProps} />;
}

export default BackupPoint;
