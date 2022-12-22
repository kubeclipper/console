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
import { ConfirmAction } from 'containers/Action';
import { rootStore } from 'stores';

const { backupPointStore, clusterStore } = rootStore;

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Backup Space');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('Delete Backup Space');
  }

  policy = 'backuppoints:edit';

  confirmContext = async (data) => {
    const res = await clusterStore.fetchList({ limit: -1 });
    const usedCluster = res.filter((item) => item.backupPoint === data.name);
    this.usedCluster = usedCluster;

    if (usedCluster.length) {
      return t(
        'Cluster {clusters} is using this backup space. Deleting the backup space will automatically unbind the relationship. Are you sure you want to delete this backup space?',
        {
          clusters: usedCluster.map((item) => item.name).join(', '),
        }
      );
    }

    const name = this.getName(data);
    return t('Are you sure to { action } {name}?', {
      action: this.actionName || this.title,
      name,
    });
  };

  onSubmit = (item) => {
    const { name } = item;

    if (this.usedCluster.length) {
      this.usedCluster.forEach(({ _originData }) => {
        delete _originData.metadata.labels['kubeclipper.io/backupPoint'];
      });

      const editClusterPromise = this.usedCluster.map(
        (cluster) =>
          new Promise((resolve) => {
            clusterStore
              .edit({ id: cluster.name }, cluster._originData)
              .then((res) => {
                resolve(res);
              });
          })
      );

      return Promise.all(editClusterPromise).then(() =>
        backupPointStore.delete({ id: name })
      );
    }
    return backupPointStore.delete({ id: name });
  };
}
