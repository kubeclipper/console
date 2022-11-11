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

/* eslint-disable guard-for-in */
/* eslint-disable new-cap */
import { isEmpty, has, merge, sortBy, cloneDeep } from 'lodash';

/**
 * 根据 properties 进行排序
 */
export function sortProperties(properties = {}) {
  const propertiesArr = Object.entries(properties);
  const sortPropertiesArr = propertiesArr.sort(
    (a, b) => -(b[1].priority ?? 0) + (a[1].priority ?? 0)
  );

  return Object.fromEntries(sortPropertiesArr);
}

/**
 * 根据 dependence 过滤 components
 * 插件依赖的那个插件不存在时，该插件不显示
 * ['kubernetes', 'nodes'] 为确定存在的依赖
 * @param {*} schema
 * @returns
 */
export function filterComponents(components = [], dep) {
  const fixedDependence = ['kubernetes', 'nodes'].concat(dep);
  let _components = [];

  components.forEach((component) => {
    const { dependence = [] } = component;

    const _dependence = dependence.filter(
      (x) => !fixedDependence.some((y) => x === y)
    );
    const isDependenceExist = _dependence.every((a) =>
      components.some((b) => a === b.category)
    );

    if (isEmpty(dependence) || isDependenceExist) {
      _components.push(component);
    }
  });

  _components = sortBy(_components, ['name', 'priority']).reverse();

  return _components;
}

const commonProperties = {
  // width: '150%',
};

/**
 *
 * @param {*} properties
 * @returns
 */
export function formatProperty(properties) {
  for (const key in properties) {
    properties[key] = { ...commonProperties, ...properties[key] };

    /** api 返回 properties 内 未包含 title 时，默认用 key 作为 title，即表单的 label */
    if (!has(properties[key], 'title')) {
      properties[key] = { ...properties[key], title: key };
    }

    if (has(properties[key], 'properties')) {
      formatProperty(properties[key].properties);
    }
  }

  return sortProperties(properties);
}

const commonSchema = {
  displayType: 'row',
  labelWidth: '30%',
};

/**
 *
 * @param {*} json
 * @param {*} ui
 * @returns
 */
export const computeSchema = (json, ui) => {
  const combinedSchemas = merge(json, ui);

  return {
    ...commonSchema,
    ...combinedSchemas,
    properties: formatProperty(combinedSchemas.properties),
  };
};

/**
 *
 * @param {*} schema
 * @param {*} name
 * @returns
 */
export function getSchema(schemas, name, useEnable) {
  const schema =
    cloneDeep(schemas.find((it) => it.name === name)?.schema) ?? {};
  if (!useEnable) {
    delete schema?.properties?.enable;
  }
  return schema;
}
