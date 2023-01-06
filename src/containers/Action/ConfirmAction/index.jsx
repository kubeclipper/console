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
import { isArray } from 'lodash';
import { firstUpperCase } from 'utils';

export default class ConfirmAction {
  static actionType = 'confirm';

  constructor(props) {
    const { item, containerProps } = props;
    if (item) {
      this.item = item;
    }
    if (containerProps) {
      this.containerProps = containerProps;
    }
  }

  get id() {
    return 'id';
  }

  get actionType() {
    return 'confirm';
  }

  get actionName() {
    // use actionName || title to generate default message;
    return '';
  }

  get title() {
    return t('Delete');
  }

  get buttonType() {
    return 'default';
  }

  get buttonText() {
    // action button text use buttonText || title
    return '';
  }

  get okText() {
    return t('Confirm');
  }

  get cancelText() {
    return t('Cancel');
  }

  get isAsyncAction() {
    return false;
  }

  // eslint-disable-next-line no-unused-vars
  policy = (item) => ({});

  getName = (data) =>
    isArray(data) ? data.map((it) => it.name).join(', ') : data.name;

  /**
   * check allowed default
   * @param {*} data
   * @returns
   */
  // eslint-disable-next-line no-unused-vars
  allowedCheckFunc = (data) => true;

  allowed = (data) => {
    if (isArray(data)) {
      return Promise.all(
        data.map((it) => Promise.resolve(this.allowedCheckFunc(it)))
      );
    }
    return Promise.resolve(this.allowedCheckFunc(data));
  };

  /**
   *  check allowed after peform delete
   * @param {*} data
   * @returns
   */
  // eslint-disable-next-line no-unused-vars
  peformAllowedCheckFunc = (data) => true;

  peformAllowed = (data) => {
    if (isArray(data)) {
      return Promise.all(
        data.map((it) => Promise.resolve(this.peformAllowedCheckFunc(it)))
      );
    }
    return Promise.resolve(this.peformAllowedCheckFunc(data));
  };

  confirmContext = (data) => {
    const name = this.getName(data);
    return t('Are you sure to { action } {name}?', {
      action: this.actionName || this.title,
      name,
    });
  };

  submitSuccessMsg = (data) => {
    const name = this.getName(data);

    if (this.isAsyncAction) {
      return firstUpperCase(
        t(
          'The {name} {action} instruction has been executed. \n You can wait for a few seconds to follow the changes or manually refresh the data to get the final display result.',
          { action: this.actionName || this.title, name }
        )
      );
    }

    return firstUpperCase(
      t('{action} {name} successfully.', {
        action: this.actionName || this.title,
        name,
      })
    );
  };

  performErrorMsg = (data) => {
    const name = this.getName(data);
    return t('You are not allowed to { action } {name}.', {
      action: this.actionName || this.title,
      name,
    });
  };

  submitErrorMsg = (data, realError) => {
    if (realError) return realError;
    const name = this.getName(data);
    return t('Unable to {action} {name}.', {
      action: this.actionName || this.title,
      name,
    });
  };

  // eslint-disable-next-line no-unused-vars
  onSubmit = (data) => Promise.resolve();

  perform = async (data) => {
    if (isArray(data)) {
      if (data.length === 0) {
        return Promise.reject(t('Please select item!'));
      }
    }
    const allowedResult = await this.allowed(data);
    const peformAllowedResult = await this.peformAllowed(data);

    if (isArray(data)) {
      const items = data;

      const results = allowedResult.map(
        (it, index) => it && peformAllowedResult[index]
      );

      if (results.every((value) => !!value)) {
        return Promise.resolve(true);
      }

      const failedItems = [];
      results.forEach((value, index) => {
        if (!value) {
          failedItems.push(items[index]);
        }
      });
      const errorMsg = this.performErrorMsg(failedItems);
      return Promise.reject(errorMsg);
    }

    if (allowedResult && peformAllowedResult) {
      return Promise.resolve(true);
    }

    const errorMsg = this.performErrorMsg(data);

    return Promise.reject(errorMsg);
  };
}
