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
import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import classname from 'classnames';
import { isIPv4 } from 'utils/validate';
import styles from './index.less';

export default function IpInput(props) {
  const { value: valueProps, className, onChange, version } = props;

  const itemsRef = useRef([]);
  const flagRef = useRef(0);

  const getIpValues = useCallback(() => {
    if (!valueProps && version === 4) {
      const ip = [];
      for (let i = 0; i < 4; i++) {
        ip.push(undefined);
      }
      return ip;
    }
    if (isIPv4(valueProps)) {
      return valueProps.split('.').map((it) => Number.parseInt(it, 10));
    }

    if (version === 6) {
      return valueProps;
    }

    return valueProps.split('.');
  }, [version, valueProps]);

  const [value, setValue] = useState(getIpValues());

  useEffect(() => {
    setValue(getIpValues());
  }, [getIpValues]);

  useEffect(() => {
    const handleOnChange = (_value) => onChange && onChange(_value);

    let ret;
    if (version === 4) {
      ret = value.join('.');

      const isEmpty = value.every((it) => !it);
      if (isEmpty) {
        ret = '';
      }
    } else {
      ret = value;
    }
    handleOnChange(ret);
  }, [value, version]);

  const onInputChange = (newVal, index) => {
    function nextValue(preValue) {
      let ipValue = Number.parseInt(newVal, 10);

      if (Number.isNaN(ipValue)) {
        ipValue = undefined;
      }
      if (ipValue < 0) {
        ipValue = 0;
      }
      if (ipValue > 255) {
        ipValue = 255;
      }
      preValue[index] = ipValue;

      return [...preValue];
    }

    setValue((preValue) => nextValue(preValue));
  };

  const onInputChangeIPv6 = (_value) => setValue(_value);

  if (version === 6) {
    return (
      <div>
        <Input
          value={value}
          className={styles.ipv6}
          onChange={(e) => {
            onInputChangeIPv6(e.currentTarget.value);
          }}
        />
      </div>
    );
  }

  function getKeyCode(e) {
    e = e || (window.event ? window.event : '');
    return e.keyCode ? e.keyCode : e.which;
  }

  const onKeyUp = (e, index) => {
    const currentInputValue = itemsRef.current[index].props.value;
    if (currentInputValue === '' && getKeyCode(e) === 8) {
      flagRef.current++;

      if (flagRef.current > 1) {
        itemsRef.current[index - 1]?.focus();
        flagRef.current = 0;
      }
    }
  };

  return (
    <div className={classname('input-ip', styles['ip-input'], className)}>
      {value.map((it, index) => (
        <div className={styles['item-wrapper']} key={`ipinput-${index}`}>
          <Input
            className={styles.item}
            value={value[index] === undefined ? '' : value[index]}
            ref={(el) => (itemsRef.current[index] = el)}
            maxLength="3"
            onChange={(e) => {
              const inputValue = e.currentTarget.value.replace(
                /[^\-?\d.]/g,
                ''
              );

              onInputChange(inputValue, index);
            }}
            onKeyUp={(e) => onKeyUp(e, index)}
          />
        </div>
      ))}
    </div>
  );
}

IpInput.propTypes = {
  value: PropTypes.string,
  version: PropTypes.number,
  onChange: PropTypes.func,
};

IpInput.defaultProps = {
  version: 4,
  onChange() {},
};
