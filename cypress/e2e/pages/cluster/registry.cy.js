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
import { testCase } from '../../../support/common';

describe('镜像仓库', () => {
  const listUrl = '/cluster/registry';
  const uuid = Cypress._.random(0, 1e6);
  const registryName = `registry-${uuid}`;
  const offLineRegistry = Cypress.env('offLineRegistry');
  const harbor = Cypress.env('httpsRegistry');
  const des = 'des';

  beforeEach(() => {
    cy.login(listUrl);
  });

  afterEach(() => {
    cy.addContext();
  });

  // http 镜像仓库
  it(...testCase('集群管理-镜像仓库-添加-http-1').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.formInput('name', registryName).formInput('description', des);
    cy.formInputRegistry(
      'host',
      0,
      offLineRegistry
    ).clickModalActionSubmitButton();

    cy.tableSearchText(registryName)
      .checkTableRowLength()
      .checkTableColVal(1, registryName)
      .checkTableColVal(2, `http://${offLineRegistry}`)
      .checkTableColVal(3, des)
      .clearSearchInput();

    cy.deleteRegistry(registryName);
  });

  // https 镜像仓库
  it(...testCase('集群管理-镜像仓库-添加-https-1').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.readFile('cypress/config/harborCa').then((harborCa) => {
      cy.formInput('name', registryName)
        .formInput('description', des)
        .formInputRegistry('host', 1, harbor)
        .formTextarea('ca', harborCa)
        .clickModalActionSubmitButton();

      cy.tableSearchText(registryName)
        .checkTableRowLength()
        .checkTableColVal(1, registryName)
        .checkTableColVal(2, harbor)
        .checkTableColVal(3, des)
        .clearSearchInput();
    });

    cy.deleteRegistry(registryName);
  });

  // https 镜像仓库
  it(...testCase('集群管理-镜像仓库-添加-https-2').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.formInput('name', registryName)
      .formInput('description', des)
      .formInputRegistry('host', 1, harbor)
      .clickModalActionSubmitButton();

    cy.tableSearchText(registryName)
      .checkTableRowLength()
      .checkTableColVal(1, registryName)
      .checkTableColVal(2, harbor)
      .checkTableColVal(3, des)
      .clearSearchInput();

    cy.deleteRegistry(registryName);
  });

  // https 镜像仓库
  it(...testCase('集群管理-镜像仓库-添加-https-3').smoke().value(), () => {
    cy.clickHeaderButton(0);

    cy.formInput('name', registryName)
      .formInput('description', des)
      .formInputRegistry('host', 1, harbor)
      .formSwitchClick('tlsCheck')
      .clickModalActionSubmitButton();

    cy.tableSearchText(registryName)
      .checkTableRowLength()
      .checkTableColVal(1, registryName)
      .checkTableColVal(2, harbor)
      .checkTableColVal(3, des)
      .clearSearchInput();
  });

  // 删除镜像仓库
  it(
    ...testCase('集群管理-镜像仓库-删除-http-docker-1').smoke().value(),
    () => {
      cy.deleteRegistry(registryName);
    }
  );

  // 删除镜像仓库
  it.skip(
    ...testCase('集群管理-镜像仓库-删除-https-docker-1').smoke().value(),
    () => {}
  );

  // 删除镜像仓库
  it.skip(
    ...testCase('集群管理-镜像仓库-删除-http-containerd-1').smoke().value(),
    () => {}
  );

  // 删除镜像仓库
  it.skip(
    ...testCase('集群管理-镜像仓库-删除-https-containerd-1').smoke().value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-集群设置-CRI 镜像仓库-http-containerd-1')
      .smoke()
      .value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-集群设置-CRI 镜像仓库-https-docker-1')
      .smoke()
      .value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-集群设置-CRI 镜像仓库-https-docker-2')
      .smoke()
      .value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-集群设置-CRI 镜像仓库-https-docker-3')
      .smoke()
      .value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-集群设置-CRI 镜像仓库-https-containerd-1')
      .smoke()
      .value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-集群设置-CRI 镜像仓库-https-containerd-2')
      .smoke()
      .value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-集群设置-CRI 镜像仓库-https-containerd-3')
      .smoke()
      .value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-节点设置-添加节点-http-docker-1').smoke().value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-节点设置-添加节点-http-containerd-1')
      .smoke()
      .value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-节点设置-添加节点-https-docker-1').smoke().value(),
    () => {}
  );

  // 使用 http 镜像仓库
  it.skip(
    ...testCase('集群-更多-节点设置-添加节点-https-containerd-1')
      .smoke()
      .value(),
    () => {}
  );
});
