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
import { dayOfWeekOption } from 'resources/date';

export const backupStatus = {
  creating: t('Creating'),
  available: t('Available'),
  error: t('Error'),
  restoring: t('Restoring'),
};

export const backupFilters = [
  {
    label: t('Name'),
    name: 'name',
    fieldKey: 'metadata.name',
  },
];

export const backupColumns = [
  {
    title: t('Backup Name'),
    dataIndex: 'name',
  },
  {
    title: t('Description'),
    dataIndex: 'description',
    isHideable: true,
  },
  {
    title: t('BackupPoint'),
    dataIndex: 'backupPointName',
  },
  {
    title: t('K8S Version'),
    dataIndex: 'kubernetesVersion',
    isHideable: true,
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    isHideable: true,
    render: (v) => backupStatus[v] || v,
  },
  {
    title: t('Create Time'),
    dataIndex: 'createTime',
    valueRender: 'toLocalTime',
  },
];

export const backupTableProps = {
  searchFilters: backupFilters,
  columns: backupColumns,
};

export const circleDayofFirstLevel = [
  {
    label: t('Every Day'),
    key: 'day',
    value: '0 0 * * *',
  },
  {
    label: t('Every Week'),
    key: 'dayOfWeek',
    value: '0 0 * * 0',
  },
  {
    label: t('Every Month'),
    key: 'dayOfMonth',
    value: '0 0 1 * *',
  },
];

export const circleDayofSecondLevel = {
  day: [],
  dayOfWeek: dayOfWeekOption,
  dayOfMonth: [
    ...[...Array(31)].map((_, index) => ({
      label: index + 1,
      value: index + 1,
    })),
    {
      label: t('LastDayOfMonth'),
      value: 'L',
    },
  ],
};
