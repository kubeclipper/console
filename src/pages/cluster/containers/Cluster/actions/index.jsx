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

const actionConfigs = {
  rowActions: {
    firstAction: LinkLog,
    moreActions: [
      { action: Edit },
      { action: Backup },
      { action: Restore },
      { action: Upgrade },
      { action: LinkAddStorage },
      { action: LinkAddPlugin },
      { action: Reset },
      { action: SaveAsTemplate },
      { action: Terminal },
      { action: Delete },
    ],
  },
  batchActions: [Delete],
  primaryActions: [Create],
};

export default actionConfigs;
