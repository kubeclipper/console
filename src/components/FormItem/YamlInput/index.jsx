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
import { Form } from 'antd';
import { yamlValidator } from 'utils/validate';
import CodeEditor from 'components/CodeEditor';

function YamlInput(props) {
  const getRules = (rules) => {
    let newRules = {
      validator: yamlValidator,
    };
    if (rules && rules.length > 0) {
      newRules = {
        ...newRules,
        ...rules[0],
      };
    }
    return [newRules];
  };

  const { componentProps, formItemProps } = props;
  const { rules, ...rest } = formItemProps;
  const newRules = getRules(rules);
  const newFormItemProps = {
    ...rest,
    rules: newRules,
  };
  const options = {
    ...componentProps,
  };

  return (
    <Form.Item {...newFormItemProps}>
      <CodeEditor options={options} />
    </Form.Item>
  );
}

YamlInput.isFormItem = true;

export default YamlInput;
