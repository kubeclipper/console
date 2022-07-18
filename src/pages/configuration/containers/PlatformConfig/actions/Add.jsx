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
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { rootStore } from 'stores';
import { isIp, isIpPort } from 'utils/validate';

@observer
class Add extends ModalAction {
  init() {
    this.store = rootStore.templateStore;
  }

  static id = 'add';

  static title = t('Add');

  static policy = 'platform:edit';

  get name() {
    return t('Add');
  }

  static allowed = () => Promise.resolve(true);

  checkIp = async (_, value) => {
    for (const item of toJS(this.store.list.data)) {
      if (item.host === value) return Promise.reject(t('IP Repeat'));
    }
    if (!isIp(value) && !isIpPort(value)) {
      return Promise.reject(t('IP invalid'));
    }
    return Promise.resolve();
  };

  get formItems() {
    return [
      {
        name: 'host',
        label: t('Registry IP Address'),
        type: 'input',
        placeholder: t('Please input registry Address'),
        validator: this.checkIp,
        required: true,
      },
      {
        name: 'description',
        label: t('Remarks Column'),
        type: 'input',
        placeholder: t('Please input registry remark'),
      },
    ];
  }

  onSubmit = (values) => {
    const datas = [values, ...toJS(this.store.list.data)];
    return this.store.update(datas);
  };
}

export default Add;
