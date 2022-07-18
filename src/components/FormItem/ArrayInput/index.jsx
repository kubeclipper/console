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
import React, { useState, useEffect } from 'react';
import { Select, Button, Input, Collapse } from 'antd';
import {
  PlusCircleFilled,
  MinusCircleFilled,
  DoubleRightOutlined,
} from '@ant-design/icons';
import { isEmpty, isArray, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './index.less';
import { generateId } from 'utils';

const { Panel } = Collapse;

export default function ArrayInput(props) {
  const {
    value,
    maxCount,
    defaultItemValue,
    onChange,
    minCount,
    tips,
    optionsByIndex,
    options,
    placeholder,
    width,
    itemComponent,
    readonlyKeys = [],
    isInput = false,
    initValue,
  } = props;

  const getInitialState = () => {
    if (!isEmpty(initValue)) {
      return isArray(initValue) ? [...initValue] || [] : [];
    }
    return isArray(value) ? [...value] || [] : [];
  };

  const [items, setItems] = useState(() => getInitialState());

  const [keyId] = useState(generateId());

  useEffect(() => {
    if (value && !isEqual(value, items)) {
      setItems(value);
    }
  }, [value]);

  useEffect(() => {
    onChange(items);
  }, [items]);

  const addItem = () => {
    if (items.length >= maxCount) return;
    const newItem = {
      value: defaultItemValue,
      index: items.length,
    };
    setItems([...items, newItem]);
  };

  const canRemove = (index) => index >= minCount;

  const removeItem = (index) => {
    items.splice(index, 1);
    setItems([...items]);
  };

  const onItemChange = (newVal, index) => {
    items[index] = {
      value: newVal,
      index,
    };
    setItems([...items]);
  };

  const renderTip = () => (tips ? <div>{tips}</div> : null);

  const getOptions = (itemIndex) => {
    // special: index=0, use [options[0]]; index=1 use [options[1]]; index >= options.length, options
    if (!optionsByIndex) return options;
    if (itemIndex < options.length) return [options[itemIndex]];
    return options;
  };

  const renderItem = (item, index) => {
    if (!itemComponent) {
      if (isInput) {
        return (
          <Input
            value={item.value}
            placeholder={placeholder || t('Please input')}
            style={{ width }}
            onChange={(e) => {
              onItemChange(e.currentTarget.value, index);
            }}
          />
        );
      }
      return (
        <Select
          className={styles.float}
          options={getOptions(index)}
          value={item.value}
          placeholder={placeholder}
          style={{ width }}
          onChange={(newValue) => {
            onItemChange(newValue, index);
          }}
        />
      );
    }
    const ItemComponent = itemComponent;
    const { key = '' } = item.value || {};
    const keyReadonly = readonlyKeys.indexOf(key) >= 0;
    return (
      <ItemComponent
        {...props}
        name={`name-${index}`}
        value={item.value}
        index={index}
        keyReadonly={keyReadonly}
        onChange={(newValue) => {
          onItemChange(newValue, index);
        }}
      />
    );
  };

  const renderItems = () => {
    const selects = items.map((it, index) => (
      <div
        className={classnames('item', styles.item)}
        key={`array-input-item-${keyId}-${index}`}
      >
        <div
          className={classnames(
            styles.float,
            styles['item-detail'],
            'item-detail'
          )}
        >
          {renderItem(it, index)}
        </div>
        <Button
          type="link"
          onClick={() => removeItem(index)}
          className={classnames(styles.float, styles['remove-btn'])}
          disabled={it.disabled || !canRemove(index)}
        >
          <MinusCircleFilled />
        </Button>
      </div>
    ));
    return <div className={styles.items}>{selects}</div>;
  };

  const renderAdd = () => {
    const { addText, addTextTips } = props;
    let _tips = '';
    if (maxCount !== Infinity) {
      _tips =
        tips +
        t('Can add { number } {name}', {
          number: maxCount - items.length,
          name: addTextTips || '',
        });
    }

    return (
      <div>
        <Button
          className={classnames(styles['add-btn'], 'add-btn')}
          type="link"
          onClick={addItem}
        >
          <PlusCircleFilled />
          {addText}
        </Button>
        {_tips}
      </div>
    );
  };

  return (
    <div className={styles['array-input']}>
      <Collapse
        defaultActiveKey={['1']}
        expandIcon={({ isActive }) => (
          <span>
            {isActive ? t('Collapse') : t('Expand')}{' '}
            <DoubleRightOutlined rotate={isActive ? -90 : 90} />
          </span>
        )}
        expandIconPosition="left"
      >
        <Panel key="1">
          {renderTip()}
          {renderItems()}
          {renderAdd()}
        </Panel>
      </Collapse>
    </div>
  );
}

ArrayInput.propTypes = {
  minCount: PropTypes.number,
  maxCount: PropTypes.number,
  tips: PropTypes.node,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  defaultItemValue: PropTypes.any,
  addText: PropTypes.string,
  addTextTips: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  itemComponent: PropTypes.any,
  optionsByIndex: PropTypes.bool, // special: index=0, use [options[0]]; index=1 use [options[1]]; index >= options.length, options
  initValue: PropTypes.array,
  readonlyKeys: PropTypes.array,
  onChange: PropTypes.func,
};

ArrayInput.defaultProps = {
  minCount: 0,
  maxCount: Infinity,
  addText: t('Add'),
  placeholder: t('Please select'),
  width: 200,
  itemComponent: null,
  optionsByIndex: false,
  initValue: [],
  readonlyKeys: [],
  onChange: () => {},
};
