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
import React from 'react';
import { toJS } from 'mobx';
import { Collapse } from 'antd';
import { observer } from 'mobx-react';
import { LinkAction } from 'containers/Action';
import Footer from 'components/Footer';
import { rootStore } from 'stores';
import { uniq, set } from 'lodash';
import Notify from 'components/Notify';
import EditAuthorization from 'pages/access/componnets/EditAuthorization';
import FORM_TEMPLATES from 'utils/form.templates';
import BaseInfo from './baseInfo';
import styles from './index.less';

const { Panel } = Collapse;

const { roleStore } = rootStore;

@observer
export default class Create extends LinkAction {
  constructor(props) {
    super(props);
    this.state = {
      roleTemplates: [],
    };

    this.store = roleStore;
  }

  static id = 'role';

  static title = t('Create Role');

  static path = `/access/role/create`;

  static allowed = () => Promise.resolve(true);

  static policy = 'roles:create';

  baseInfoRef = React.createRef();

  authRef = React.createRef();

  get routing() {
    return rootStore.routing;
  }

  get listUrl() {
    return '/access/role';
  }

  get name() {
    return t('Create Role');
  }

  get formTemplate() {
    return FORM_TEMPLATES.roles();
  }

  get baseInfo() {
    return this.baseInfoRef.current;
  }

  componentDidMount() {
    this.store.fetchRoleTemplates({ limit: -1 });
  }

  onOK = () => {
    const { roleTemplates } = this.authRef.current;
    const templates = uniq([...roleTemplates]);

    const formTemplate = FORM_TEMPLATES.roles();

    this.baseInfo.formRef.current.validateFields().then(async (values) => {
      const { name, description } = values;

      if (templates.length === 0) {
        Notify.warn(t('Please check at least one permission'));
        return;
      }

      const annotations = {
        'kubeclipper.io/aggregation-roles': JSON.stringify(templates),
        ...(description ? { 'kubeclipper.io/description': description } : {}),
      };

      set(formTemplate, 'metadata.name', name);
      set(formTemplate, 'metadata.annotations', annotations);

      try {
        await this.store.create(formTemplate);
        Notify.success(
          t('Role {name} has been created successfully.', { name })
        );

        this.routing.push(this.listUrl);
      } catch (error) {
        Notify.error(error.reason);
      }
    });
  };

  render() {
    return (
      <div className={styles.wrapper}>
        <Collapse
          defaultActiveKey={['1', '2']}
          expandIcon={({ isActive }) => (
            <span>{isActive ? t('Collapse') : t('Expand')}</span>
          )}
          expandIconPosition="right"
        >
          <Panel header={t('Base Info')} key="1">
            <BaseInfo ref={this.baseInfoRef} />
          </Panel>
          <Panel
            header={t('Role Authorization')}
            key="2"
            className={styles.auth}
          >
            <EditAuthorization
              ref={this.authRef}
              roleTemplates={toJS(this.store.roleTemplates.data)}
              formTemplate={this.formTemplate}
            />
          </Panel>
        </Collapse>
        <Footer onOK={() => this.onOK()} />
      </div>
    );
  }
}
