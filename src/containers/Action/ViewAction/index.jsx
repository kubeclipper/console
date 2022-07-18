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
import React, { Component } from 'react';

export default class ViewAction extends Component {
  static get modalSize() {
    return 'small';
  }

  static allowed() {
    return Promise.resolve();
  }

  constructor(props) {
    super(props);
    this.init();
  }

  get name() {
    return t('View');
  }

  get isModal() {
    return true;
  }

  get containerProps() {
    return this.props.containerProps || {};
  }

  get item() {
    const { item } = this.props;
    return item || { name: '' };
  }

  static id = 'viewAction';

  static actionType = 'viewModal';

  static title = t('View');

  init() {
    this.store = {};
  }

  renderContent = () => null;

  render() {
    return <div style={{ padding: '24px' }}>{this.renderContent()}</div>;
  }
}
