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
/* eslint-disable no-bitwise */
import React from 'react';
import { Tag } from 'antd';
import i18n from 'core/i18n';
import { keyValue2Obj, arrayInputValue } from 'utils';

const { t } = i18n;

const roleColor = {
  master: 'red',
  worker: 'blue',
  ingress: 'purple',
  externalLB: 'cyan',
};

export const getRoles = (role) => {
  const roles = [];

  const _roles = Object.keys(roleColor);
  if (_roles.includes(role)) {
    roles.push(role);
  } else {
    roles.push('-');
  }
  return roles;
};

export const getNodeRole = (role) =>
  getRoles(role).map((v) => (
    <span key={v}>
      {v !== '-' && (
        <Tag color={roleColor[v]} style={{ marginBottom: '2px' }}>
          {v}
        </Tag>
      )}
      {v === '-' && '-'}
    </span>
  ));

export const formatNodes = (nodes) => {
  const obj = {};
  nodeEnum.forEach((key) => {
    const node = nodes.find((v) => v.key === key);

    if (node) {
      const { value = [] } = node;
      obj[key] = (value || []).map((v) => ({ id: v.id }));
    }
  });

  return obj;
};

export const formatNodesWithLabel = ({ nodes, taints, nodeLabels: labels }) => {
  const nodeTaints = arrayInputValue(taints);
  const nodeLabels = arrayInputValue(labels);
  const obj = formatNodes(nodes);

  // eslint-disable-next-line guard-for-in
  for (const k in obj) {
    obj[k] = obj[k].map((it) => {
      const res = { id: it.id };

      const taint = nodeTaints
        .filter((rt) => rt.nodeId === it.id)
        .map(({ key, value, effect }) => ({ key, value, effect }));
      const label = nodeLabels
        .filter((rt) => rt.nodeId === it.id)
        .map(({ key, value }) => ({ key, value }));

      if (taint) {
        res.taints = taint;
      }

      if (label) {
        res.labels = keyValue2Obj(label);
      }

      return res;
    });
  }

  return obj;
};

export const nodeStatus = {
  Ready: t('Ready'),
  checking: t('Checking'),
  ready: t('Ready'),
  NotReady: t('NotReady'),
  unAvailable: t('unAvailable'),
  unReachable: t('unReachable'),
  Removeing: t('Removeing'),
  'N/A': t('N/A'),
  True: 'Ready',
  False: 'NotReady',
  Unknown: 'Unknown',
};

export const nodeEnum = ['master', 'worker', 'ingress', 'balance'];

export const status = {
  True: 'Ready',
  False: 'NotReady',
  Unknown: 'Unknown',
};
