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
import React, { useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { Input, Tag, Menu, Divider, Button, Checkbox, Row, Col } from 'antd';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { isEmpty, isBoolean, isEqual } from 'lodash';
import styles from './index.less';

const option = PropTypes.shape({
  label: PropTypes.string.isRequired,
  key: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.bool.isRequired,
  ]),
  component: PropTypes.node,
});

const filterParam = PropTypes.shape({
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isSingle: PropTypes.bool,
  isServer: PropTypes.bool,
  allowed: PropTypes.func,
  options: PropTypes.arrayOf(option),
  isTime: PropTypes.bool,
});

export const getTags = (initValue, filterParams) => {
  if (!initValue || isEmpty(initValue)) {
    return {};
  }
  if (isEmpty(filterParams)) {
    return {};
  }
  const tags = [];
  const checkValues = [];
  Object.keys(initValue).forEach((key) => {
    const item = filterParams.find((it) => it.name === key);
    if (item) {
      const { options = [] } = item;
      const value = initValue[key];
      if (options.length) {
        const optionItem = options.find((op) => op.key === value);
        if (optionItem && optionItem.isQuick) {
          checkValues.push(`${item.name}--${value}`);
        }
      }
      tags.push({
        value,
        filter: item,
      });
    }
  });
  return {
    tags,
    checkValues,
  };
};

export default function MagicInput(props) {
  const {
    filterParams,
    placeholder,
    initValue,
    onInputChange: _onInputChange,
    onInputFocus: _onInputFocus,
  } = props;

  const { tags: _tags = [], checkValues: _checkValues = [] } = getTags(
    initValue,
    filterParams
  );

  const tagRef = useRef(_tags);

  if (!isEqual(tagRef.current, _tags)) {
    tagRef.current = _tags;
  }

  const inputRef = React.createRef();
  const initialState = {
    isFocus: false,
    inputValue: false,
    tags: _tags,
    currentFilter: null,
    optionClear: false,
    checkValues: _checkValues,
  };

  const reducer = (state, action) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case 'clearAll':
        return {
          ...state,
          isFocus: false,
          tags: [],
          currentFilter: null,
          optionClear: false,
          checkValues: [],
        };
      case 'selectFilter':
        return {
          ...state,
          ...action.payload,
          isFocus: true,
        };
      case 'tagClose':
        return {
          ...state,
          ...action.payload,
          optionClear: false,
        };
      case 'clearOptions':
        return {
          ...state,
          optionClear: true,
        };
      case 'changeCheck':
        return {
          ...state,
          ...action.payload,
        };
      case 'setIsFocus':
        return {
          ...state,
          isFocus: true,
        };
      case 'updateInput':
        return {
          ...state,
          ...action.payload,
          currentFilter: null,
          inputValue: '',
        };
      case 'inputChange':
        return {
          ...state,
          ...action.payload,
        };
      case 'clearCurrentFilter':
        return {
          ...state,
          currentFilter: null,
        };
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { isFocus, inputValue, tags, currentFilter, optionClear, checkValues } =
    state;

  useEffect(() => {
    if (!isEqual(tags, tagRef.current)) {
      _onInputChange?.(tags);
    }
  }, [tags]);

  useEffect(() => {
    _onInputFocus?.(isFocus);
  }, [isFocus]);

  const renderMenu = () => {
    if (inputValue) {
      return null;
    }
    if (!isFocus) {
      return null;
    }
    if (currentFilter) {
      return renderOptions();
    }
    const getFilterParams = () => {
      const filters = [];
      filterParams.forEach((item) => {
        const alreadyTag = tags.find((it) => it.filter.name === item.name);
        if (!alreadyTag) {
          filters.push(item);
        }
      });
      return filters;
    };
    let filters = getFilterParams();
    if (optionClear) {
      filters = [];
    }

    const menuItems = filters.map(({ name, label }) => (
      <Menu.Item key={name}>{label}</Menu.Item>
    ));

    const renderOptionsClose = () => {
      if (
        optionClear ||
        !filters[0] ||
        filterParams.length === filters.length
      ) {
        return null;
      }

      const clearOptions = () => {
        dispatch({
          type: 'clearOptions',
        });
      };

      return (
        <>
          <Button
            className={styles['close-option-btn']}
            type="link"
            icon={<CloseOutlined />}
            onClick={clearOptions}
          />
        </>
      );
    };

    const handleSelectFilter = ({ key }) => {
      const filter = filterParams.find((it) => it.name === key);
      dispatch({
        type: 'selectFilter',
        payload: {
          currentFilter: filter,
        },
      });
      inputRef.current.focus();
    };

    return (
      <Menu className={styles.menu} onClick={handleSelectFilter}>
        {renderOptionsClose()}
        {menuItems}
      </Menu>
    );
  };

  const renderTags = () => {
    const tagItems = tags.map((it) => {
      const { filter, value } = it;
      const { options } = filter;
      let label = value;
      if (options) {
        const current = options.find((item) => {
          const key = isBoolean(item.key) ? item.key.toString() : item.key;
          return key === (isBoolean(value) ? value.toString() : value);
        });
        label = current ? current.label : value;
      }

      return (
        <Tag
          key={filter.name}
          closable
          onClose={() => handleTagClose(filter.name)}
        >
          <span>{filter.label}</span>
          <Divider type="vertical" />
          <span>{label}</span>
        </Tag>
      );
    });

    return tagItems;
  };

  const handleKeyUp = (e) => {
    const { keyCode } = e;
    // BackSpace / Delete
    if (keyCode === 8 || keyCode === 46) {
      const { value } = inputRef.current.state;
      if (currentFilter && isEmpty(value)) {
        dispatch({
          type: 'clearCurrentFilter',
        });
      } else if (tags.length > 0 && isEmpty(value)) {
        this.handleTagClose(tags[tags.length - 1].filter.name);
      }
    }
  };

  const handleTagClose = (name) => {
    const newTags = tags.filter((it) => it.filter.name !== name);

    const leftCheckValues = checkValues.filter(
      (it) => it.split('--')[0] !== name
    );

    dispatch({
      type: 'tagClose',
      payload: {
        tags: newTags,
        checkValues: leftCheckValues,
      },
    });
  };

  const renderKey = () => {
    if (!currentFilter) {
      return null;
    }
    return (
      <span className={styles.key}>
        {`${currentFilter.label}`}
        <Divider type="vertical" />
      </span>
    );
  };

  const clearInputValue = () => {
    inputRef.current.setState({
      value: '',
    });
  };

  const renderClose = () => {
    if (!isFocus) {
      return null;
    }

    const clearAll = () => {
      clearInputValue();
      dispatch({ type: 'clearAll' });
    };

    return (
      <Col className={styles['close-btn-col']}>
        <Button
          className={styles['close-btn']}
          type="link"
          icon={<CloseOutlined />}
          onClick={clearAll}
        />
      </Col>
    );
  };

  const onChangeCheck = (values) => {
    const changedValues = [];
    values.forEach((it) => {
      if (checkValues.indexOf(it) < 0) {
        changedValues.push({
          key: it,
          value: true,
        });
      }
    });
    checkValues.forEach((it) => {
      if (values.indexOf(it) < 0) {
        changedValues.push({
          key: it,
          value: false,
        });
      }
    });
    const checkValuesNames = Array.from(
      new Set([...checkValues, ...values])
    ).map((it) => it.split('--')[0]);
    const otherTags = tags.filter(
      (it) => checkValuesNames.indexOf(it.filter.name) < 0
    );
    const newTags = [];
    changedValues.forEach((it) => {
      const { key, value } = it;
      if (value) {
        const name = key.split('--')[0];
        const realValue = key.split('--')[1];
        const filter = filterParams.find((tt) => tt.name === name);
        newTags.push({
          value: realValue,
          filter,
        });
      }
    });

    dispatch({
      type: 'changeCheck',
      payload: {
        tags: [...otherTags, ...newTags],
        checkValues: values,
      },
    });
  };

  const renderChecks = () => {
    const getChecks = () => {
      const checks = [];
      filterParams.forEach((it) => {
        const { options = [] } = it;
        options.forEach((op) => {
          const { isQuick = false } = op;
          if (isQuick) {
            checks.push({
              ...op,
              father: it,
            });
          }
        });
      });
      return checks;
    };

    const checks = getChecks();
    if (checks.length === 0) {
      return null;
    }
    const options = checks.map((it) => {
      const { checkLabel, key, father } = it;
      return {
        label: checkLabel,
        value: `${father.name}--${key}`,
      };
    });
    return (
      <div
        className={classnames(
          styles['magic-input-checks'],
          'magic-input-checks'
        )}
      >
        <Checkbox.Group
          options={options}
          onChange={onChangeCheck}
          value={checkValues}
        />
      </div>
    );
  };

  const handleBlur = () => {
    if (currentFilter) {
      dispatch({
        type: 'setIsFocus',
      });
    }
  };

  const handleFocus = () => {
    dispatch({
      type: 'setIsFocus',
    });
  };

  const handleEnter = (e) => {
    e && e.preventDefault();
    e && e.stopPropagation();
    const { value } = e.currentTarget;
    if (!value) {
      return;
    }
    updateInput(value);
  };

  const updateInput = (value) => {
    const newTag = {
      value,
      filter: currentFilter || filterParams.find((it) => !it.options),
    };
    clearInputValue();
    const newTags = tags.filter((it) => it.filter.name !== newTag.filter.name);
    newTags.push(newTag);
    dispatch({
      type: 'updateInput',
      payload: {
        tags: newTags,
      },
    });
  };

  const renderOptions = () => {
    const { options, correlateOption } = currentFilter;
    if (!options) {
      return null;
    }

    const correlateTag = tags.filter(
      (it) => it.filter.name === correlateOption
    );
    let suboptions = [];
    if (correlateOption && correlateTag[0]) {
      suboptions = options.filter(
        (it) => it.correlateValue.indexOf(correlateTag[0].value) > -1
      );
    }
    const menuItems = (suboptions[0] ? suboptions : options).map((it) => (
      <Menu.Item key={it.key}>{it.label}</Menu.Item>
    ));

    const handleOptionClick = ({ key }) => {
      let value;
      if (key === 'true') {
        value = true;
      } else {
        value = key === 'false' ? false : key;
      }
      updateInput(value);
    };

    return (
      <Menu className={styles['option-menu']} onClick={handleOptionClick}>
        {menuItems}
      </Menu>
    );
  };

  const handleInputChange = (e) => {
    dispatch({
      type: 'inputChange',
      payload: {
        inputValue: e.target.value,
      },
    });
  };

  return (
    <div
      className={classnames(
        styles['magic-input-outer-wrapper'],
        'magic-input-outer-wrapper'
      )}
    >
      <Row
        className={classnames(
          'magic-input-wrapper',
          styles['magic-input-wrapper'],
          isFocus ? styles['magic-input-wrapper-active'] : ''
        )}
      >
        <Col>{renderTags()}</Col>
        <Col>{renderKey()}</Col>
        <Col className={styles['input-wrapper']}>
          <Input
            className={styles.input}
            ref={inputRef}
            autoFocus={isFocus}
            placeholder={placeholder}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onPressEnter={handleEnter}
            onKeyUp={handleKeyUp}
          />
          {renderMenu()}
        </Col>
        <Col className={styles['search-icon']}>
          <SearchOutlined />
        </Col>
        {renderClose()}
      </Row>
      {renderChecks()}
    </div>
  );
}

MagicInput.propTypes = {
  filterParams: PropTypes.arrayOf(filterParam),
  initValue: PropTypes.object,
  placeholder: PropTypes.string,
  onInputChange: PropTypes.func,
  onInputFocus: PropTypes.func,
};

MagicInput.defaultProps = {
  filterParams: [],
  initValue: {},
  placeholder: t('Click here for filters.'),
};
