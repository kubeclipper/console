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

import { MODULE_KIND_MAP } from './constants';

const getUserTemplate = () => ({
  kind: 'User',
  apiVersion: 'iam.kubeclipper.io/v1',
  metadata: {
    name: '',
    annotations: {},
  },
  spec: {},
});

const getRoleTemplate = () => ({
  kind: 'GlobalRole',
  apiVersion: 'iam.kubeclipper.io/v1',
  metadata: {
    name: '',
    annotations: {},
  },
});

const getBackupTemplate = () => ({
  metadata: {
    name: '',
  },
  description: '',
});

const getDnsTemplate = () => ({
  kind: 'Domain',
  apiVersion: 'core.kubeclipper.io/v1',
  metadata: {
    name: '',
  },
  spec: {
    description: '',
  },
});

const getScheduledBackupTemplate = () => ({
  kind: 'CronBackup',
  metadata: {
    name: '',
    labels: {},
  },
  spec: {},
});

const getCloudProviderTemplate = () => ({
  kind: 'CloudProvider',
  apiVersion: 'core.kubeclipper.io/v1',
  metadata: {
    annotations: {},
  },
  ssh: {},
});

const getRegistryTemplate = () => ({
  kind: 'Registry',
  apiVersion: 'core.kubeclipper.io/v1',
  metadata: {
    annotations: {},
  },
  host: '',
  scheme: '',
});

const FORM_TEMPLATES = {
  users: getUserTemplate,
  roles: getRoleTemplate,
  backups: getBackupTemplate,
  dns: getDnsTemplate,
  scheduledBackup: getScheduledBackupTemplate,
  cloudproviders: getCloudProviderTemplate,
  registries: getRegistryTemplate,
};

export default FORM_TEMPLATES;

export const getFormTemplate = (module) => {
  const kind = MODULE_KIND_MAP[module];

  if (!kind || !FORM_TEMPLATES[module]) {
    return {};
  }

  const template = FORM_TEMPLATES[module]();

  return {
    [kind]: template,
  };
};
