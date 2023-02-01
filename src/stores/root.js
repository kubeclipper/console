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

import ClusterStore from './cluster';
import UserStore from './user';
import RoleStore from './role';
import RegionStore from './region';
import NodeStore from './node';
import OperationStore from './operation';
import LicenseStore from './license';
import BackUpStore from './backup';
import RegistryStore from './registry';
import TemplatesStore from './templates';
import BackupPointStore from './backupPoint';
import LogStore from './log';
import CornBackupStore from './cronBackup';
import CloudProviderStore from './cloudprovider';
import AuditStore from './audit';

export default {
  ClusterStore,
  UserStore,
  RoleStore,
  RegionStore,
  NodeStore,
  OperationStore,
  LicenseStore,
  BackUpStore,
  RegistryStore,
  TemplatesStore,
  BackupPointStore,
  LogStore,
  CornBackupStore,
  CloudProviderStore,
  AuditStore,
};
