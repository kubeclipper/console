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

Cypress.Commands.add('createVersion', ({ name }) => {
  const versionListUrl = '/version/config';
  const description = 'e2e-desc';
  const dependency = `conntrack-tools-1.4.4-7.el7.x86_64.rpm
                      kubernetes-cni-0.8.7-0.x86_64.rpm
                      socat-1.7.3.2-2.el7.x86_64.rpm
                      cri-tools-1.13.0-0.x86_64.rpm
                      kubeadm-1.19.2-0.x86_64.rpm
                      libnetfilter_cthelper-1.0.0-11.el7.x86_64.rpm
                      ebtables-2.0.10-16.el7.x86_64.rpm
                      kubectl-1.19.2-0.x86_64.rpm
                      libnetfilter_cttimeout-1.0.0-7.el7.x86_64.rpm
                      ipvsadm-1.27-8.el7.x86_64.rpm
                      kubelet-1.19.2-0.x86_64.rpm
                      libnetfilter_queue-1.0.2-2.el7_2.x86_64.rpm`;

  cy.visitPage(versionListUrl)
    .clickHeaderButton(1)
    .formInput('name', name)
    .formInput('description', description)
    .formTextarea('dependency', dependency)
    .clickModalActionSubmitButton()
    .waitTableLoading();
});

Cypress.Commands.add('deleteVersion', ({ name }) => {
  const versionListUrl = '/version/config';
  cy.visitPage(versionListUrl)
    .tableSearchText(name)
    .clickActionButtonByTitle('Delete')
    .clickConfirmActionSubmitButton()
    .clearSearchInput();
});
