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

import { get, cloneDeep, keyBy, groupBy, sortBy, uniqBy } from 'lodash';
import React, { useReducer, forwardRef, useImperativeHandle } from 'react';
import { useDeepCompareEffect } from 'hooks';
import Tabs from 'components/Tabs';
import { ROLE_MODULES } from './constants';
import CheckItem from './CheckItem';

const EditAuthorization = forwardRef((props, ref) => {
  const initialState = {
    roleTemplates: [],
    roleModules: [],
    roleTemplatesMap: '',
    currentModule: '',
    groupedTemplates: '',
  };

  const reducer = (state, newState) => ({ ...state, ...newState });

  const [state, setState] = useReducer(reducer, initialState);

  const {
    roleTemplates,
    roleModules,
    roleTemplatesMap,
    currentModule,
    groupedTemplates,
  } = state;

  useImperativeHandle(ref, () => ({
    roleTemplates,
  }));

  useDeepCompareEffect(() => {
    const _roleTemplatesMap = keyBy(props.roleTemplates, 'name');

    const _roleTemplates = props.formTemplate.roleTemplates || [];

    const _roleModules = cloneDeep(ROLE_MODULES.globalroles)
      .filter((item) => !item.hide)
      .map((item) => ({
        ...item,
        state: _roleTemplates.some(
          (name) =>
            get(
              _roleTemplatesMap[name],
              'annotations["kubeclipper.io/module"]'
            ) === item.name
        )
          ? 'Enabled'
          : 'Not Enabled',
      }));

    setState({
      ...state,
      roleTemplatesMap: _roleTemplatesMap,
      roleTemplates: _roleTemplates,
      roleModules: _roleModules,
      currentModule: _roleModules[0].name,
      groupedTemplates: groupBy(props.roleTemplates, 'module'),
    });
  }, [props.roleTemplates]);

  const sortedTtemplates = sortBy(
    groupedTemplates[currentModule] || [],
    'aliasName'
  ).reverse();

  const templates = uniqBy(sortedTtemplates, (it) => it.aliasName);

  const handleCheckChange = (_roleTemplates) => {
    const roleModule = roleModules.find((item) => item.name === currentModule);
    if (roleModule) {
      roleModule.state = groupedTemplates[currentModule].some((item) =>
        _roleTemplates.includes(item.name)
      )
        ? 'Enabled'
        : 'Not Enabled';
    }

    setState({ ...state, roleTemplates: _roleTemplates });
  };

  const { tabClassName, tabStyles, isModlal = false } = props;

  const handleTabChange = (tab) => {
    setState({ ...state, currentModule: tab });
  };

  return (
    <>
      <Tabs
        tabs={roleModules}
        current={currentModule}
        tabClassName={tabClassName}
        tabStyles={tabStyles}
        onChange={handleTabChange}
        isModlal={isModlal}
      >
        {templates.map((item) => (
          <CheckItem
            key={item.name}
            data={item}
            roleTemplates={roleTemplates}
            roleTemplatesMap={roleTemplatesMap}
            onChange={handleCheckChange}
          />
        ))}
      </Tabs>
    </>
  );
});

export default EditAuthorization;
