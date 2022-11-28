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

import { observer } from 'mobx-react';
import Base from 'pages/access/containers/Role/actions/Create';
import { rootStore } from 'stores';
import { isAdminPage } from 'utils';
import { ROLE_MODULES } from 'utils/constants';

const { projectRoleStore } = rootStore;
@observer
export default class Create extends Base {
  constructor(props) {
    super(props);
    this.state = {
      roleTemplates: [],
    };

    this.store = projectRoleStore;
  }

  static path = (item, containerProps) => {
    if (this.isAdminPage) {
      const { id } = containerProps.detail;
      return `/access/projects-admin/role-create/${id}`;
    }

    return `/project/role/create`;
  };

  static isAdminPage = isAdminPage(window.location.pathname);

  static policy = () =>
    this.isAdminPage ? 'projects:create' : 'projectroles:create';

  get project() {
    return this.props.match.params?.id;
  }

  get listUrl() {
    return `/access/projects-admin/${this.project}?tab=projectRole`;
  }

  get roleModule() {
    return ROLE_MODULES.projectroles;
  }

  componentDidMount() {
    this.store.fetchRoleTemplates({ limit: -1, project: this.project });
  }
}
