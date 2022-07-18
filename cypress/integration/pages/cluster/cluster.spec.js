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
import getTitle from '../../../support/common';

let nodeIp;
let cluster_id;

describe('The Cluster Page', () => {
  const uuid = Cypress._.random(0, 1e6);
  const listUrl = '/cluster/info';
  const name = `e2e.cluster.name${uuid}`;
  const description = 'e2e-description';
  const region = 'region1';
  const cluster_type = 'testing';
  const backup_name = `e2e-backup-name-${uuid}`;
  const auto_backup_name = `e2e-auto-backup-name-${uuid}`;

  beforeEach(() => {
    cy.login(listUrl);
  });

  it('successfully create', () => {
    cy.clickHeaderButton(1)
      .wait(2000)
      .url()
      .should('include', 'cluster/create')
      .formInput('cluster_name', name)
      .formInput('description', description)
      .formSelect('private_registry_address')
      .formSelect('container_runtime_type', 'Docker')
      .formSelect('region', region)
      .clickStepActionNextButton()
      .waitTransferList()
      .formMultiTransfer('nodes', 0)
      .formMultiTransfer('nodes', 0, 1)
      .clickStepActionNextButton()
      .clickStepActionNextButton()
      .clickStepActionNextButton()
      .clickStepActionNextButton()
      .clickStepActionNextButton()
      .formCheckboxClick('kubesphere_enable')
      .formRadioButtonChoose('multicluster', 0)
      .formRadioButtonChoose('cluster_type', 2)
      .clickStepActionNextButton()
      .clickStepActionNextButton()
      .get('.ant-spin-spinning', { timeout: 600000 })
      .should('not.exist')
      .url()
      .should('include', listUrl)
      .wait(2000)
      .tableSearchText(name)
      .waitStatusSuccess();
  });

  it('successfully detail', () => {
    cy.tableSearchText(name).goToDetail(0);
    cy.checkDetailName(name);
    cy.get('#detail-right-side')
      .find('.detail-right-card')
      .last()
      .find('.ant-col')
      .contains(cluster_type)
      .should('exist');

    cy.goBackToList(listUrl);
  });

  it('successfully get cluster id', () => {
    cy.tableSearchText(name);
    cy.get('.ant-table-row')
      .first()
      .find('a')
      .then(($a) => {
        cluster_id = $a.text();
        cy.log('cluster_id', cluster_id);
      });
  });

  it('successfully get a ip without used', () => {
    cy.visit('/node/info');
    cy.get('.ant-table-body')
      .find('.ant-btn-more')
      .as('more')
      .its('length')
      .then((res) => {
        if (res > 0) {
          cy.get('@more')
            .eq(0)
            .parent()
            .siblings()
            .as('row')
            .find('a')
            .then(($a) => {
              nodeIp = $a.text();
            });
        }
      });
  });

  it('successfully join cluster', () => {
    cy.visit('/node/info');

    cy.tableSearchText(nodeIp)
      .clickActionInMore('Join Cluster')
      .formSelect('cluster', cluster_id)
      .clickModalActionSubmitButton();
  });

  it('successfully remove node from cluster', () => {
    cy.visit('/node/info');
    cy.tableSearchText(nodeIp).goToDetail();
    cy.get('.ant-descriptions-view')
      .find('.ant-descriptions-item')
      .find('a')
      .click()
      .wait(2000)
      .clickTab('Nodes List')
      .tableSearchText(nodeIp)
      .waitStatusSuccess()
      .wait(4000)
      .clickFirstActionButton()
      .wait(1000)
      .clickConfirmActionSubmitButton()
      .wait(2000)
      .waitStatusNoError()
      .checkEmptyTable();
  });

  it('successfully auto backup cluster', () => {
    cy.visit(listUrl).wait(2000);
    cy.tableSearchText(name)
      .clickActionInMore('Auto Backup')
      .formInput('backup_regular_name', auto_backup_name)
      .clickModalActionSubmitButton(2000)
      .checkActionDisabled('Auto Backup');
  });

  it('successfully stop auto backup cluster', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Stop Auto Backup')
      .clickConfirmActionSubmitButton(2000)
      .checkActionDisabled('Stop Auto Backup');
  });

  it('successfully backup cluster & restore & delete backup', () => {
    cy.tableSearchText(name)
      .clickActionInMore('Backup Cluster')
      .formInput('backup_name', backup_name)
      .clickModalActionSubmitButton()
      .waitStatusBackuping();
    cy.clickMenu(0, 1).url().should('include', '/cluster/backup');
    cy.get('.table-header-btns').get('.ant-select').click().wait(2000);
    cy.get('.ant-select-item-option')
      .contains(cluster_id)
      .click({ force: true });
    cy.tableSearchText(backup_name).waitStatusSuccess();

    cy.clickActionInMore('Restore').clickConfirmActionSubmitButton(2000);
    cy.get('.ant-table-row')
      .first()
      .contains(getTitle('Processing'))
      .should('exist');
    cy.waitStatusProcessing().visit('/cluster/backup');
    cy.get('.table-header-btns').get('.ant-select').click().wait(2000);
    cy.get('.ant-select-item-option')
      .contains(cluster_id)
      .click({ force: true });
    cy.tableSearchText(backup_name)
      .clickActionInMore('Delete')
      .clickConfirmActionSubmitButton(2000);
  });

  it('successfully delete', () => {
    const statusText = getTitle('Running');
    cy.tableSearchText(name)
      .clickActionInMore('Delete')
      .clickConfirmActionSubmitButton(2000)
      .waitStatusProcessing();
    cy.get('.ant-table-row').each(($el) => {
      cy.get($el)
        .find('.ant-table-cell')
        .contains(statusText)
        .should('not.exist');
    });
  });
});
