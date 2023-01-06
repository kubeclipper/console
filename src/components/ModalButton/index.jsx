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
import React, { useState, memo } from 'react';
import { Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import { generateId } from 'utils';
import Notify from 'components/Notify';

function ModalButton(props) {
  const [visible, setVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    item,
    modalSize,
    className,
    okText,
    cancelText,
    render,
    component,
    showCancelButton,
    zIndex,
    buttonText,
    title,
    danger,
    style,
    buttonType,
    buttonClassName,
    handleOk,
    onBeforeShow,
    footer,
  } = props;

  const getModalWidth = (size) => {
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

  const onClick = () => {
    if (onBeforeShow && !onBeforeShow()) {
      return;
    }

    showModal();
  };

  const handleOnok = async () => {
    if (handleOk) {
      setSubmitLoading(true);
      try {
        await handleOk();

        hideModal();
        setSubmitLoading(false);
      } catch (err) {
        const { message } = err;
        Notify.error(message);
        setSubmitLoading(false);
      }
    } else {
      hideModal();
    }
  };

  const handleCancel = () => {
    hideModal();
  };

  const hideModal = () => {
    setVisible(false);
  };

  const showModal = () => {
    setVisible(true);
  };

  const renderModal = () => {
    if (!visible) {
      return null;
    }

    const width = getModalWidth(modalSize);
    const content = render ? render(item) : component;

    const configs = {
      visible,
      title,
      key: `modal-${generateId()}`,
      className,
      width,
      onOk: handleOnok,
      onCancel: handleCancel,
      okText,
      cancelText,
      confirmLoading: submitLoading,
      zIndex,
      footer,
    };
    if (!showCancelButton) {
      configs.cancelButtonProps = {
        style: { display: 'none' },
      };
    }
    return <Modal {...configs}>{content}</Modal>;
  };

  return (
    <>
      <Button
        type={buttonType}
        danger={danger}
        onClick={onClick}
        className={buttonClassName}
        style={style}
      >
        {buttonText || title}
      </Button>
      {renderModal()}
    </>
  );
}

export default memo(ModalButton);

ModalButton.propTypes = {
  title: PropTypes.string.isRequired,
  buttonType: PropTypes.string,
  render: PropTypes.func,
  component: PropTypes.node,
  item: PropTypes.any,
  modalSize: PropTypes.string,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  handleOk: PropTypes.func,
  className: PropTypes.string,
  buttonText: PropTypes.string,
  buttonClassName: PropTypes.string,
  showCancelButton: PropTypes.bool,
  style: PropTypes.object,
};

ModalButton.defaultProps = {
  buttonType: 'primary',
  render: () => {},
  component: null,
  item: null,
  okText: t('Confirm'),
  cancelText: t('Cancel'),
  handleOk: () => {},
  className: '',
  buttonClassName: '',
  showCancelButton: false,
  style: {},
};
