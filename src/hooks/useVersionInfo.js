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
import React, { useEffect } from 'react';
import Version from 'components/VersionInfo/Version';
import useModal from './useModal';
import { useRootStore } from 'stores';

export default function useVersionInfo() {
  const [modal, ModalDOM] = useModal();
  const { licenseStore: store } = useRootStore();

  useEffect(() => {
    async function getSourceData() {
      await store.getVersion();
    }
    getSourceData();
  }, []);

  const handleVersionClick = () => {
    modal.open({
      children: <Version />,
      bodyStyle: { padding: '24px 50px' },
      footer: null,
    });
  };

  return [handleVersionClick, ModalDOM];
}
