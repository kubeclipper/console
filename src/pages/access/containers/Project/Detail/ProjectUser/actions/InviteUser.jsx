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
import { observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import { rootStore } from 'stores';
import { Select } from 'antd';
import PojectUserStore from 'stores/project/user';

@observer
class ManagerUser extends ModalAction {
  constructor(props) {
    super(props);

    this.state = {
      newProjectRoles: {},
    };
  }

  async init() {
    this.store = rootStore.userStore;
    this.projectRoleStore = rootStore.projectRoleStore;
    this.projectUserStore = new PojectUserStore();

    await this.getProjectRole();
    await this.getUser();
    await this.getProjectUser();
  }

  async getUser() {
    await this.store.fetchList({
      limit: -1,
    });
  }

  async getProjectUser() {
    await this.projectUserStore.fetchList({
      limit: -1,
      project: this.project,
    });
  }

  async getProjectRole() {
    await this.projectRoleStore.fetchList({
      labelSelector: '!kubeclipper.io/role-template',
      limit: -1,
      project: this.project,
    });
  }

  static id = 'user-invite';

  static title = t('Invite User');

  static policy = this.isAdminPage
    ? 'projects:create'
    : 'projectmembers:create';

  static get modalSize() {
    return 'middle';
  }

  get project() {
    if (this.isAdminPage) {
      return this.item.id;
    }
    return rootStore.currentProject;
  }

  get labelCol() {
    return {
      span: 2,
    };
  }

  get wrapperCol() {
    return {
      span: 22,
    };
  }

  get module() {
    return 'projectmembers';
  }

  get name() {
    return t('Invite User');
  }

  get roles() {
    return (this.roleStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.name,
    }));
  }

  get currentProjectUser() {
    return this.projectUserStore.list.data || [];
  }

  static allowed = () => Promise.resolve(true);

  get users() {
    return (this.store.list.data || [])
      .filter((x) => !this.currentProjectUser.some((y) => x.id === y.id))
      .map((it) => ({
        ...it,
        key: it.id,
      }));
  }

  get projectRolesList() {
    const projectRole = this.projectRoleStore.list.data || [];
    return projectRole;
  }

  defaultProjectRoles(id) {
    const item = this.currentProjectUser.find((it) => id === it.id);
    if (id && item) {
      return item.role;
    }
    return `${this.project}-admin`;
  }

  projectRolesOptions = () =>
    this.projectRolesList.map((it) => ({
      label: it.name,
      value: it.name,
    }));

  get leftUserTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
      {
        dataIndex: 'displayName',
        title: t('DisplayName'),
      },
    ];
  }

  projectRoleChange = (value, id) => {
    const { newProjectRoles } = this.state;
    newProjectRoles[id] = value;
    this.setState({ newProjectRoles });
  };

  get rightUserTable() {
    return [
      {
        dataIndex: 'name',
        title: t('Name'),
      },
      {
        dataIndex: 'displayName',
        title: t('DisplayName'),
      },
      {
        title: t('Select Projct Role'),
        dataIndex: 'id',
        render: (id) => (
          <Select
            size="small"
            options={this.projectRolesOptions()}
            defaultValue={this.defaultProjectRoles(id)}
            onChange={(value) => this.projectRoleChange(value, id)}
            onClick={(e) => {
              e && e.stopPropagation();
            }}
            style={{ maxWidth: '120px' }}
          />
        ),
      },
    ];
  }

  get formItems() {
    return [
      {
        name: 'select_user',
        label: t('Select User'),
        type: 'transfer',
        leftTableColumns: this.leftUserTable,
        rightTableColumns: this.rightUserTable,
        dataSource: this.users,
        disabled: false,
        showSearch: true,
        required: true,
      },
    ];
  }

  onSubmit = ({ select_user }) => {
    const { newProjectRoles } = this.state;
    const data = select_user.map((name) => ({
      userName: name,
      role: newProjectRoles[name] ?? this.defaultProjectRoles(),
    }));

    return rootStore.projectUserStore.create(data, { project: this.project });
  };
}

export default ManagerUser;
