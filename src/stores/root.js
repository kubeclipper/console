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

import BackUpStore from './backup';
import BackupPointStore from './backupPoint';
import CloudProviderStore from './cloudprovider';
import ClusterStore from './cluster';
import CornBackupStore from './cronBackup';
import LicenseStore from './license';
import LogStore from './log';
import NodeStore from './node';
import OperationStore from './operation';
import ProjectStore from './project';
import ProjectRoleStore from './project/role';
import ProjectUserStore from './project/user';
import RegionStore from './region';
import RegistryStore from './registry';
import RoleStore from './role';
import TemplatesStore from './templates';
import UserStore from './user';

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
  ProjectStore,
  ProjectUserStore,
  ProjectRoleStore,
};
