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
import { Dropdown, Menu, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import ActionButton from '../ActionButton';
import { generateId } from 'utils';
import styles from '../index.less';

const updateConf = (conf, selectedItems) => {
  const {
    id,
    title,
    actionType,
    buttonType,
    buttonText,
    isBatch = true,
    combineBatch,
  } = conf;
  return {
    id,
    title,
    name: buttonText || title,
    actionType,
    buttonType,
    action: conf,
    isAllowed: selectedItems.length > 0,
    items: selectedItems,
    isBatch,
    needHide: false,
    combineBatch,
  };
};

function DropdownActionButton({
  actions,
  selectedItems,
  onFinishAction,
  containerProps,
}) {
  if (actions.length < 1) {
    return null;
  }
  const menuItems = actions.map((it) => {
    const key = `table-batch-more-${generateId()}`;
    const newConf = updateConf(it, selectedItems);
    const { buttonType } = newConf;
    newConf.onFinishAction = onFinishAction;
    newConf.danger = buttonType === 'danger';
    return (
      <Menu.Item key={key}>
        <ActionButton
          {...newConf}
          buttonType="link"
          onFinishAction={onFinishAction}
          containerProps={containerProps}
          buttonClassName={styles['more-action-btn']}
        />
      </Menu.Item>
    );
  });
  const menu = <Menu>{menuItems}</Menu>;
  return (
    <Dropdown
      overlay={menu}
      className={styles['table-action']}
      overlayClassName={styles['table-batch-menu']}
    >
      <Button type="primary">
        {t('More Actions')} {<DownOutlined />}
      </Button>
    </Dropdown>
  );
}

export default function BatchAction(props) {
  const {
    selectedItems,
    visibleButtonNumber,
    actionList,
    onFinishAction,
    containerProps,
    onSelectRowKeys,
  } = props;
  let moreButton = null;
  let batchButtons = null;
  let showedActions = [];
  let restActions = [];

  if (visibleButtonNumber < actionList.length) {
    if (visibleButtonNumber < 0) {
      restActions = actionList;
    } else {
      showedActions = actionList.slice(0, visibleButtonNumber);
      restActions = actionList.slice(visibleButtonNumber);
    }
  } else {
    showedActions = actionList;
  }

  const handleFinishAction = () => {
    onSelectRowKeys([]);
    onFinishAction();
  };

  batchButtons = showedActions.map((it) => (
    <ActionButton
      {...updateConf(it, selectedItems)}
      key={`table-btach-action-${generateId()}`}
      buttonClassName={styles['table-action']}
      onFinishAction={handleFinishAction}
      containerProps={containerProps}
    />
  ));
  moreButton = (
    <DropdownActionButton
      actions={restActions}
      selectedItems={selectedItems}
      onFinishAction={handleFinishAction}
      containerProps={containerProps}
    />
  );
  return (
    <>
      {batchButtons}
      {moreButton}
    </>
  );
}

BatchAction.prototypes = {
  visibleButtonNumber: PropTypes.number,
};

BatchAction.defaultProps = {
  visibleButtonNumber: 1,
};
