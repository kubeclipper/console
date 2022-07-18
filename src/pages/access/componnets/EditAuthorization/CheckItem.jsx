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
import { get, isEmpty } from 'lodash';

import { Checkbox, Tag } from 'antd';
import Notify from 'components/Notify';
import Text from 'components/Text';

import styles from './index.less';

const CheckItem = (props) => {
  const { roleTemplates, roleTemplatesMap, data, onChange } = props;

  const handleCheck = () => {
    let newTemplates = [...roleTemplates];
    if (newTemplates.includes(data.name)) {
      const relateTemplates = newTemplates.filter(
        (template) =>
          template !== data.name &&
          getDependencies([template]).includes(data.name)
      );
      if (relateTemplates.length === 0) {
        newTemplates = newTemplates.filter((item) => item !== data.name);
      } else {
        Notify.warn(
          t('RULE_RELATED_WITH', {
            resource: relateTemplates
              .map((rt) => t(get(roleTemplatesMap, `[${rt}].aliasName`)))
              .join(', '),
          })
        );
      }
    } else {
      newTemplates.push(data.name);
    }

    onChange([...newTemplates, ...getDependencies(newTemplates)]);
  };

  const getDependencies = (names) => {
    const dependencies = [];

    if (isEmpty(names)) {
      return dependencies;
    }

    names.forEach((name) => {
      const template = roleTemplatesMap[name];
      if (template.dependencies) {
        template.dependencies.forEach((dep) => {
          if (!names.includes(dep) && !dependencies.includes(dep)) {
            dependencies.push(dep);
          }
        });
      }
    });

    if (dependencies.length > 0) {
      dependencies.push(...getDependencies(dependencies));
    }

    return dependencies;
  };

  const newDependencies = getDependencies([data.name]);

  return (
    <div className={styles.checkItem}>
      <Checkbox
        checked={roleTemplates.includes(data.name)}
        onClick={handleCheck}
      />
      <Text
        title={t(data.aliasName)}
        onClick={handleCheck}
        description={t(
          `${data.aliasName.toUpperCase().replace(/\s+/g, '_')}_DESC`
        )}
      />
      {newDependencies.length > 0 && (
        <div className={styles.extra}>
          {t('Depend on')}:{' '}
          {newDependencies.map((item) => (
            <Tag className={styles.tag} type="info" key={item}>
              {t(get(roleTemplatesMap, `[${item}].aliasName`))}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckItem;
