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
import { isArray } from 'lodash';

const { roleStore, userStore } = rootStore;
export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Role');
  }

  get buttonType() {
    return 'danger';
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete role');
  }

  isInternal = (item) => item.isInternal;

  isUsed = async (item) => {
    const res = await userStore.fetchList({ role: item.name });

    return !!(res && res.length < 1);
  };

  allowedCheckFunc = (item) => !this.isInternal(item);

  peformAllowedCheckFunc = (item) => this.isUsed(item);

  performErrorMsg = (data) => {
    const name = this.getName(data);

    if (isArray(data)) {
      return t(
        'Role {name} are used, please change the user role before delete',
        { name }
      );
    }

    const userCount = userStore.list.data.length;
    return t(
      `Role is authorized to {name} users, please change the user role before delete`,
      { name: userCount }
    );
  };

  policy = () => 'roles:delete';

  onSubmit = (data) => {
    const { id } = data;
    return roleStore.delete({ id });
  };
}
