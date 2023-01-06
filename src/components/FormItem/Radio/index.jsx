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
import { Radio } from 'antd';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './index.less';

export default function CustomRadio(props) {
  const {
    options,
    optionType,
    buttonStyle,
    onlyRadio,
    className,
    onChange,
    value,
    isWrappedValue,
    ...rest
  } = props;

  const handelOnChange = (e) => {
    const { value: val } = e.target;
    if (!isWrappedValue) {
      onChange(val);
    } else {
      const option = options.find((it) => it.value === val);
      onChange(option);
    }
  };

  const getValue = () => {
    if (value === undefined) return value;
    return isWrappedValue ? value.value : value;
  };

  const items = options.map((it) =>
    optionType === 'default' ? (
      <Radio value={it.value} key={it.value} disabled={it.disabled}>
        {it.label}
      </Radio>
    ) : (
      <Radio.Button value={it.value} key={it.value} disabled={it.disabled}>
        {it.label}
      </Radio.Button>
    )
  );

  return (
    <Radio.Group
      {...rest}
      optionType={optionType}
      buttonStyle={buttonStyle}
      className={classnames(className, onlyRadio ? styles['only-radio'] : '')}
      onChange={handelOnChange}
      value={getValue()}
    >
      {items}
    </Radio.Group>
  );
}

CustomRadio.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func,
  optionType: PropTypes.string,
  buttonStyle: PropTypes.string,
  onlyRadio: PropTypes.bool,
  isWrappedValue: PropTypes.bool,
};

CustomRadio.defaultProps = {
  options: [],
  onChange: () => {},
  optionType: 'button',
  buttonStyle: 'solid',
  onlyRadio: false,
  isWrappedValue: false,
};
