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
import AddNodes from '../Detail/NodesList/actions/Add';
import AssignProject from './AssignProject';
import Backup from './Backup';
import Create from './Create';
import Delete from './Delete';
import Edit from './Edit';
import KubeConfig from './KubeConfig';
import LinkAddPlugin from './LinkAddPlugin';
import LinkAddStorage from './LinkAddStorage';
import LinkLog from './LinkLog';
import Registry from './Registry';
import RemoveNodes from './RemoveNodes';
import Reset from './Reset';
import Restore from './Restore';
import SaveAsTemplate from './SaveAsTemplate';
import ScheduledBackup from './ScheduledBackup';
import Terminal from './Terminal';
import UpdateLicense from './UpdateLicense';
import Upgrade from './Upgrade';

const actionConfigs = {
  rowActions: {
    firstAction: LinkLog,
    moreActions: [
      { action: Terminal },
      {
        title: t('Cluster Settings'),
        actions: [Edit, SaveAsTemplate, Registry, AssignProject],
      },
      {
        title: t('Node management'),
        actions: [AddNodes, RemoveNodes],
      },
      {
        title: t('Backup and recovery'),
        actions: [Backup, ScheduledBackup, Restore],
      },
      {
        title: t('Cluster Status'),
        actions: [Reset, Upgrade, Delete],
      },
      {
        title: t('Plugin management'),
        actions: [LinkAddPlugin, LinkAddStorage],
      },
      {
        title: t('Certificate Management'),
        actions: [UpdateLicense, KubeConfig],
      },
    ],
  },
  batchActions: [Delete],
  primaryActions: [Create],
};

export default actionConfigs;
