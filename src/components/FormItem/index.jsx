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
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import {
  Form,
  Input,
  InputNumber,
  Slider,
  Tooltip,
  DatePicker,
  TimePicker,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Select from './Select';
import Label from './Label';
import SelectTable from './SelectTable';
import More from './More';
import ArrayInput from './ArrayInput';
import IpInput from './IpInput';
import IpPort from './IpPort';
import Radio from './Radio';
import Descriptions from './Descriptions';
import NameInput from './NameInput';
import PortRange from './PortRange';
import SliderInput from './SliderInput';
import Switch from './Switch';
import Checkbox from './Checkbox';
import Transfer from './Transfer';
import CheckboxGroup from './CheckboxGroup';
import Tab from './Tab';
import Metadata from './Metadata';
import TaintInput from './TaintInput';
import LabelInput from './LabelInput';
import Tags from './Tags';
import SelectWithInput from './SelectWithInput';
import SelectCycle from './SelectCycle';
import Divider from './Divider';
import DNSRecord from './DNSRecord';
import SelectForValue from './SelectForValue';
import YamlInput from './YamlInput';
import IPGroup from './IPGroup';

export const type2component = {
  label: Label,
  input: Input,
  select: Select,
  divider: Divider,
  'short-divider': Divider,
  'select-cycle': SelectCycle,
  radio: Radio,
  'select-table': SelectTable,
  'select-value': SelectForValue,
  'input-number': InputNumber,
  'input-password': Input.Password,
  'input-name': NameInput,
  'port-range': PortRange,
  more: More,
  textarea: Input.TextArea,
  'array-input': ArrayInput,
  'ip-input': IpInput,
  descriptions: Descriptions,
  slider: Slider,
  'slider-input': SliderInput,
  switch: Switch,
  check: Checkbox,
  transfer: Transfer,
  'check-group': CheckboxGroup,
  'range-picker': DatePicker.RangePicker,
  tab: Tab,
  tags: Tags,
  'time-picker': TimePicker,
  'date-picker': DatePicker,
  metadata: Metadata,
  'taint-input': TaintInput,
  'label-input': LabelInput,
  'select-input': SelectWithInput,
  'dns-record': DNSRecord,
  'yaml-input': YamlInput,
  'ip-group': IPGroup,
  'ip-port': IpPort,
};

export default function FormItem(props) {
  const {
    component,
    type,
    content,
    icon,
    iconType,
    className,
    options,
    placeholder,
    mode,
    onChange,
    isWrappedValue,
    disabled,
    defaultValue,
    dropdownRender,
    name,
    label,
    tip,
    help,
    extra,
    style,
    hidden,
    labelCol,
    wrapperCol,
    dependencies,
    initialValue,
    required,
    rules,
    validator,
    otherRule,
    isInItem,
    validateFirst,
    validateTrigger,
  } = props;

  const getComponentProps = (_type) => {
    switch (_type) {
      case 'label': {
        return { content, icon, iconType };
      }
      case 'divider':
        return {
          className,
          isInItem,
        };
      case 'select': {
        return {
          options,
          placeholder,
          mode,
          onChange,
          isWrappedValue,
          tip,
          disabled,
          defaultValue,
          dropdownRender,
        };
      }
      default: {
        const { validator: _validator, ...rest } = props;
        return { ...rest };
      }
    }
  };

  const getFormItemProps = () => {
    const getRules = () => {
      if (rules) return rules;
      const newRules = [];
      const newRule = {};
      const requiredRule = {};
      if (required) {
        if (tip) {
          requiredRule.required = true;
          requiredRule.message = t('Please input!');
        } else {
          newRule.required = required;
        }
      }
      if (!isEmpty(requiredRule)) {
        newRules.push(requiredRule);
      }
      if (validator) {
        newRule.validator = validator;
      } else if (type === 'select-table' && required) {
        const getSelectTableValidator = (rule, value) => {
          if (!value || value.selectedRowKeys.length === 0) {
            return Promise.reject(t('Please select!'));
          }
          return Promise.resolve();
        };
        newRule.validator = getSelectTableValidator;
      }
      if (!isEmpty(newRule)) {
        newRules.push(newRule);
      }
      if (otherRule) {
        newRules.push(otherRule);
      }

      return newRules;
    };

    const renderLabel = () => {
      if (!tip) return label;

      const renderTip = () => {
        if (!tip) return null;
        return (
          <Tooltip title={tip}>
            <QuestionCircleOutlined />
          </Tooltip>
        );
      };

      return (
        <span>
          {label}&nbsp;{renderTip()}
        </span>
      );
    };

    const base = {
      name,
      label: renderLabel(label, tip),
      help,
      extra,
      className,
      style,
      hidden,
      labelCol,
      wrapperCol,
      rules: getRules(),
      dependencies,
      initialValue,
    };

    switch (type) {
      case 'label':
        return {
          ...base,
          className: 'form-item-text',
        };
      case 'select-table':
      case 'array-input':
        return {
          ...base,
          validateFirst,
          validateTrigger,
        };
      case 'descriptions':
      case 'divider':
      case 'transfer':
      case 'check-group':
      default:
        return base;
    }
  };

  const formItemProps = getFormItemProps();

  const renderComponent = (TypeComp, componentProps) => {
    if (TypeComp === Radio.Group) {
      const { options: _options, buttonStyle, ...rest } = componentProps;
      const items = _options.map((it) => (
        <Radio.Button value={it.value} key={it.value}>
          {it.label}
        </Radio.Button>
      ));
      return (
        <Radio.Group buttonStyle="buttonStyle" {...rest}>
          {items}
        </Radio.Group>
      );
    }
    return <TypeComp {...componentProps} />;
  };

  const TypeComp = type2component[type];

  if (component) {
    return <Form.Item {...formItemProps}>{component}</Form.Item>;
  }

  const componentProps = getComponentProps(type);

  if (TypeComp) {
    if (TypeComp.isFormItem) {
      return (
        <TypeComp
          formItemProps={formItemProps}
          componentProps={componentProps}
        />
      );
    }
    const curComp = renderComponent(TypeComp, componentProps);
    return <Form.Item {...formItemProps}>{curComp}</Form.Item>;
  }

  if (content) {
    return (
      <Form.Item {...formItemProps}>
        <span {...componentProps}>{content}</span>
      </Form.Item>
    );
  }
  return null;
}

FormItem.propTypes = {
  component: PropTypes.object,
  type: PropTypes.string,
  content: PropTypes.any,
  className: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  rules: PropTypes.array,
  required: PropTypes.bool,
  validator: PropTypes.func,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  mode: PropTypes.string,
  onChange: PropTypes.func,
};

FormItem.defaultProps = {
  required: false,
};
