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
describe('The Cluster Page', () => {
  const testUrl = '/cluster';

  const uuid = Cypress._.random(0, 1e6);
  const name = `e2e.cluster.name${uuid}`;
  const description = 'e2e-description';
  const region = 'default';
  const confirmTitle = Cypress.env('language') === 'zh' ? '确 定' : 'Confirm';
  const externalIP = '142.22.2.2';

  beforeEach(() => {
    cy.login(testUrl);
  });

  it('create cluster 1', () => {
    cy.clickHeaderButton(0);

    cy.wait(1000).url().should('include', 'cluster/create');

    // cluster name
    cy.get('[name="name"]').clear().type(name).blur();
    cy.formSelect('region', region);
    // select node
    cy.waitTransferList();
    cy.formMultiTransfer('nodes', 0);

    // next step
    cy.clickStepActionNextButton('step-next');
    cy.wait(1000);
    cy.clickStepActionNextButton('step-quick');
    cy.clickStepActionNextButton('step-confirm');
    // check status
    cy.wait(2000).tableSearchText(name).waitStatusSuccess();
  });

  // it('create cluster 2', () => {
  //   cy.clickHeaderButton(0);

  //   cy.wait(1000).url().should('include', 'cluster/create');

  //   // cluster name
  //   cy.get('[name="name"]').clear().type(name).blur();
  //   cy.formSelect('region', region);
  //   // select node
  //   cy.waitTransferList();
  //   cy.formMultiTransfer('nodes', 0);
  //   cy.formMultiTransfer('nodes', 0, 1);
  //   cy.formMultiTransfer('nodes', 0, 1);

  //   // next step
  //   cy.clickStepActionNextButton('step-next');
  //   cy.wait(2000);
  //   cy.clickStepActionNextButton('step-quick');
  //   cy.clickStepActionNextButton('step-confirm');
  //   // check status
  //   cy.wait(2000).tableSearchText(name).waitStatusSuccess();
  // });

  it('cluster detail', () => {
    cy.tableSearchText(name).goToDetail(1);
    cy.checkDetailName(name);
  });

  // const name1 = 'e2e.cluster.name976476';

  it('edit cluster', () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Cluster Settings',
      subTitle: 'Edit',
    });
    cy.inputText('#form-item-col-description', description);
    cy.inputIP('.ant-form-item-control-input .input-ip', externalIP);

    cy.clickByTitle('.ant-modal-footer span', confirmTitle);
    cy.wait(500).waitStatusSuccess();
    cy.checkTableColVal(3, description);
  });

  it('add node', () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Node management',
      subTitle: 'AddNode',
    });
    cy.formMultiTransfer('nodes', 0);
    cy.clickByTitle('.ant-modal-footer span', confirmTitle);
    cy.wait(2000).waitStatusSuccess();
  });

  it('remove node', () => {
    cy.tableSearchText(name);
    cy.clickActionInMore({
      title: 'Node management',
      subTitle: 'RemoveNode',
    });
    cy.clickByTitle('.ant-modal-content .ant-table-tbody', 'worker');
    cy.clickByTitle('.ant-modal-footer span', confirmTitle);
    cy.wait(2000).waitStatusSuccess();
  });

  it('delete cluster 1', () => {
    cy.clickActionInMore({
      title: 'Cluster Status',
      subTitle: 'Delete Cluster',
    });

    cy.clickByTitle('.ant-modal-confirm-btns span', 'Confirm');
    // cy.tableSearchText(name).waitStatusSuccess();
  });
});
