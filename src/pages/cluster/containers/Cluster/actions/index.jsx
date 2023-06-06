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
import Delete from './Delete';
import LinkLog from './LinkLog';
import Create from './Create';
import Backup from './Backup';
import Restore from './Restore';
import Edit from './Edit';
import Upgrade from './Upgrade';
import Reset from './Reset';
import LinkAddStorage from './LinkAddStorage';
import LinkAddPlugin from './LinkAddPlugin';
import SaveAsTemplate from './SaveAsTemplate';
import Terminal from './Terminal';
import ScheduledBackup from './ScheduledBackup';
import UpdateLicense from './UpdateLicense';
import KubeConfig from './KubeConfig';
import AddNodes from '../Detail/NodesList/actions/Add';
import RemoveNodes from './RemoveNodes';
import Registry from './Registry';
import WorkLoad from './WorkLoad';

const actionConfigs = {
  rowActions: {
    firstAction: LinkLog,
    moreActions: [
      { action: Terminal },
      { action: WorkLoad },
      {
        title: t('Cluster Settings'),
        actions: [Edit, SaveAsTemplate, Registry],
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
