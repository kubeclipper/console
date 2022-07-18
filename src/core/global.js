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

import { get, uniq, isEmpty, includes } from 'lodash';
import { rootStore } from 'stores';

/**
 * class for authorization check
 */
export default class GlobalValue {
  constructor() {
    /* local cache */
    this._cache_ = {};
  }

  /**
   * Get user's enabled actions of the module
   * @param {String} module - module name
   * @returns {Array} actions of current module
   */
  getActions({ module }) {
    const adapter = (arr) => {
      if (arr.includes('manage')) {
        return uniq([...arr, 'view', 'edit', 'create', 'delete']);
      }
      return arr;
    };

    return adapter(get(rootStore.user, `globalRules[${module}]`, []));
  }

  /**
   * Check if the user has permission to perform the action(s) of the module.
   * @param {String} module - module name
   * @param {String} action - action name
   * @param {Array} actions - actions name array
   * @returns {Boolean} true or false.
   */
  hasPermission({ module, action, actions }) {
    if (!isEmpty(actions)) {
      return includes(this.getActions({ module }), ...actions);
    }

    return this.getActions({
      module,
    }).includes(action);
  }

  /**
   * check menu
   * @param {Object} item
   * @param {Function} callback
   * @returns {Boolean} true or false.
   */
  checkMenuItem(item, callback) {
    if (!item._children) {
      item._children = item.children;
    }

    if (item._children) {
      item.children = item._children.filter((child) =>
        this.checkMenuItem(child, callback)
      );

      delete item._children;

      return item.children.length > 0;
    }

    return callback({
      module: item.module,
      action: item.authAction || 'view',
    });
  }
}
