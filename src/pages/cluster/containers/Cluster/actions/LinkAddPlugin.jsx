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
import { LinkAction } from 'containers/Action';
import { rootStore } from 'stores';
import { checkExpired, isDisableByProviderType } from 'utils';

class LinkAddPlugin extends LinkAction {
  static title = t('Add Plugin');

  static isStatusRunning(item) {
    if (item.status === 'Running') {
      return true;
    }
    return false;
  }

  static hasPlugin() {
    return rootStore.hasPlugin;
  }

  static isLicensExpiration = (item) =>
    checkExpired(item.licenseExpirationTime);

  static allowed = (item) =>
    Promise.resolve(
      this.hasPlugin() &&
        this.isStatusRunning(item) &&
        this.isLicensExpiration(item) &&
        !isDisableByProviderType(item)
    );

  static path(item) {
    return `/cluster/add-plugin/${item.name}`;
  }

  static policy = 'clusters:edit';
}

export default LinkAddPlugin;
