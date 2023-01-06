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
import { Menu, Dropdown, Button, Divider } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import ActionButton from '../ActionButton';
import classnames from 'classnames';
import { isArray } from 'lodash';
import styles from './index.less';

const { SubMenu } = Menu;

function getIsAllowedValue(alloweds, index) {
  const result = alloweds[index];
  if (isArray(result)) {
    return result.every((value) => !!value);
  }
  return result;
}

function getActionConf(action) {
  const { id, title, actionType, buttonText, buttonType } = action;
  return {
    id,
    title,
    name: buttonText || title,
    actionType,
    action,
    danger: buttonType === 'danger',
  };
}

// 第一个action一定保留， aciton | 更多
const DropdownActionButton = ({
  firstAction = null,
  moreActions = [],
  alloweds = [],
  item,
  onFinishAction,
  routing,
  containerProps,
  firstActionClassName,
}) => {
  if (alloweds.length === 0) {
    return null;
  }
  if (!firstAction && moreActions.length === 0) {
    return null;
  }
  let firstElement = null;
  let dividerElement = null;
  let moreElement = null;
  if (firstAction) {
    const isAllowed = getIsAllowedValue(alloweds, 0);
    const config = getActionConf(firstAction.action, item);
    firstElement = (
      <ActionButton
        {...config}
        buttonType="link"
        routing={routing}
        needHide={false}
        isAllowed={isAllowed}
        item={item}
        onFinishAction={onFinishAction}
        buttonClassName={classnames(
          styles['first-action'],
          firstActionClassName
        )}
        containerProps={containerProps}
      />
    );
  }

  let allowedFatherCount = 0;
  let allowedAll = 0;
  let actionButton = null;
  if (moreActions.length > 0) {
    const menuContent = moreActions.map((it, index) => {
      if (!it.actions) {
        const isAllowed = getIsAllowedValue(alloweds, it.allowedIndex);
        const key = it.key || `key-more-${index}`;
        const config = getActionConf(it.action, item);
        if (!isAllowed) {
          return null;
        }
        allowedFatherCount += 1;
        allowedAll += 1;
        actionButton = (
          <ActionButton
            {...config}
            isAllowed={isAllowed}
            buttonType="link"
            item={item}
            onFinishAction={onFinishAction}
            routing={routing}
            style={{ padding: 0 }}
            containerProps={containerProps}
            buttonClassName={styles['more-action-btn']}
            isMoreAction
          />
        );
        return <Menu.Item key={key}>{actionButton}</Menu.Item>;
      }
      let allowedCount = 0;
      const menuItems = it.actions.map((action, actionIndex) => {
        const isAllowed = getIsAllowedValue(alloweds, action.allowedIndex);
        const key = action.key || `key-more-${index}-${actionIndex}`;
        if (isAllowed) {
          allowedCount += 1;
          allowedFatherCount += 1;
          allowedAll += 1;
        }
        const config = getActionConf(action.action, item);
        return (
          <Menu.Item key={key}>
            <ActionButton
              {...config}
              isAllowed={isAllowed}
              buttonType="link"
              item={item}
              onFinishAction={onFinishAction}
              routing={routing}
              containerProps={containerProps}
              buttonClassName={styles['more-action-btn']}
            />
          </Menu.Item>
        );
      });
      const menuKey = `sub-menu-${index}`;

      if (allowedCount === 0) return null;

      return (
        <SubMenu
          popupClassName={styles['action-sub-menu']}
          title={it.title}
          disabled={allowedCount === 0}
          key={menuKey}
        >
          {menuItems}
        </SubMenu>
      );
    });

    const menu = <Menu>{menuContent}</Menu>;

    if (firstAction && moreActions.length > 0 && allowedFatherCount > 0) {
      dividerElement = <Divider type="vertical" />;
    }

    if (allowedFatherCount === 1 && allowedAll === 1) {
      moreElement = <div>{actionButton}</div>;
    } else if (allowedFatherCount > 0) {
      moreElement = (
        <Dropdown overlay={menu} trigger={['click']}>
          <Button
            type="link"
            className={classnames(styles['more-action'], 'ant-btn-more')}
          >
            {t('More')} {<DownOutlined />}
          </Button>
        </Dropdown>
      );
    }
  }

  return (
    <div className={styles['action-wrapper']}>
      {firstElement}
      {dividerElement}
      {moreElement}
    </div>
  );
};

export default DropdownActionButton;
