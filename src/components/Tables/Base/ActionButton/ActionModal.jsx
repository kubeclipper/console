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
import React, { useRef } from 'react';
import { Modal, Button } from 'antd';
// import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './index.less';
import ErrorBoundary from 'components/ErrorBoundary';

const ActionModal = (props) => {
  const {
    visible,
    submitLoading,
    title,
    action,
    item,
    containerProps,
    items,
    onClose,
    onSubmitLoading,
    onCallback,
  } = props;
  const formRef = useRef();

  if (!visible) {
    return null;
  }

  const modalWidth = (size) => {
    switch (size) {
      case 'small':
        return 520;
      case 'middle':
        return 720;
      case 'large':
        return 1200;
      default:
        return 520;
    }
  };
  const ActionComponent = action;
  const { modalSize, okText, cancelText, id, className } = action;

  const width = modalWidth(modalSize);

  const renderFooter = () => {
    const { actionType } = action;

    if (actionType === 'viewModal') {
      return (
        <Button type="primary" onClick={onClose}>
          {t('Close')}
        </Button>
      );
    }
    return null;
  };

  const footer = renderFooter() ? { footer: renderFooter() } : {};

  const handleOnOk = () => {
    formRef.current.onClickSubmit(
      () => {
        onSubmitLoading();
        onClose();
        onCallback();
      },
      () => {
        onSubmitLoading();
      },
      containerProps
    );
  };

  return (
    <Modal
      title={title}
      visible={visible}
      className={classnames(`modal-${id}`, styles['modal-action'], className)}
      width={width}
      onOk={handleOnOk}
      onCancel={onClose}
      confirmLoading={submitLoading}
      okText={okText}
      cancelText={cancelText}
      {...footer}
    >
      <ErrorBoundary formError>
        <ActionComponent
          item={item}
          items={items}
          ref={formRef}
          containerProps={containerProps}
        />
      </ErrorBoundary>
    </Modal>
  );
};

export default ActionModal;
