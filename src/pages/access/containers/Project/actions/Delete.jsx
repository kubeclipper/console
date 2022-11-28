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
import { isArray, isNumber } from 'lodash';
import { rootStore } from 'stores';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Project');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete project');
  }

  hasCluster = (item) => isNumber(item.clusterCount) && item.clusterCount > 0;

  allowedCheckFunc = () => true;

  peformAllowedCheckFunc = (item) => !this.hasCluster(item);

  performErrorMsg = (data) => {
    const name = this.getName(data);

    if (isArray(data)) {
      return t(
        'Project has cluster under project, please clear the cluster before delete project.',
        {
          name,
        }
      );
    }

    return t(
      `Project has  {name} cluster under project, please clear the cluster before delete project.`,
      { name: data.clusterCount }
    );
  };

  policy = () => 'projects:delete';

  onSubmit = (data) => {
    const { id } = data;
    return rootStore.projectStore.delete({ id });
  };
}
