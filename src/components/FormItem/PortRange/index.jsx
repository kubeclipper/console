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
import { Input, Form } from 'antd';
import { portRangeValidate, portRangeMessage } from 'utils/validate';

export default function PortRange(props) {
  const {
    componentProps,
    formItemProps: { rules, ...rest },
  } = props;

  const getRules = () => {
    const newRules = {
      validator: portRangeValidate,
    };
    return [newRules, ...rules];
  };

  const _props = {
    ...componentProps,
    placeholder: t('Please input port range'),
  };

  const newFormItemProps = {
    ...rest,
    rules: getRules(),
    extra: portRangeMessage,
  };

  return (
    <Form.Item {...newFormItemProps}>
      <Input {..._props} />
    </Form.Item>
  );
}

PortRange.isFormItem = true;
