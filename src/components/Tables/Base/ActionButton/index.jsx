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
import React, { useState } from 'react';
import { Button } from 'antd';
import { isArray, isFunction } from 'lodash';
import Confirm from 'components/Confirm';
import PropTypes from 'prop-types';
import Notify from 'components/Notify';
import { firstUpperCase, allSettled } from 'utils';
import { useRootStore } from 'stores';
import ActionModal from './ActionModal';

function getDefaultMsg(action, data) {
  const { actionName, title } = action;
  const name = isArray(data) ? data.map((it) => it.name).join(', ') : data.name;
  const submitErrorMsg = t('Unable to {action} {name}.', {
    action: actionName || title,
    name,
  });
  const performErrorMsg = t('You are not allowed to { action } {name}.', {
    action: actionName || title,
    name,
  });
  const submitSuccessMsg = firstUpperCase(
    t('{action} {name} successfully.', { action: actionName || title, name })
  );
  const confirmContext = t('Are you sure to { action } {name}?', {
    action: actionName || title,
    name,
  });
  return {
    submitErrorMsg,
    submitSuccessMsg,
    confirmContext,
    performErrorMsg,
  };
}

function onSubmitOne(
  action,
  data,
  onSubmit,
  containerProps,
  afterSubmit,
  props
) {
  return new Promise((resolve, reject) => {
    const result = onSubmit(data, containerProps, props);

    if (result instanceof Promise) {
      result.then(
        () => {
          onShowSuccess(action, data, afterSubmit, props);
          resolve();
        },
        (error) => {
          reject(error);
        }
      );
    } else if (result) {
      onShowSuccess(action, data, afterSubmit, props);
      resolve();
    } else {
      reject(result);
    }
  }).catch((error) => {
    onShowError(action, data, error, props);
  });
}

function onSubmitBatch(
  action,
  data,
  onSubmit,
  containerProps,
  isBatch,
  afterSubmit,
  props
) {
  return new Promise((resolve, reject) => {
    const promises = data.map((it, index) =>
      onSubmit(it, containerProps, isBatch, index, data)
    );
    const results = allSettled(promises);
    results.then((res) => {
      const failedData = res
        .map((it, idx) => {
          if (it.status === 'rejected') {
            return {
              data: data[idx],
              reason: it.reason,
            };
          }
          return null;
        })
        .filter((it) => !!it);
      if (failedData.length === 0) {
        onShowSuccess(action, data, afterSubmit, props);
        return resolve();
      }
      failedData.forEach((it) => {
        onShowError(action, it.data, it.reason, props);
      });
      if (failedData.length === data.length) {
        return reject();
      }
      return resolve();
    });
  });
}

function onShowSuccess(action, data, afterSubmit, props) {
  const { submitSuccessMsg } = action;
  const message = submitSuccessMsg
    ? submitSuccessMsg(data)
    : getDefaultMsg(action, data).submitSuccessMsg;
  Notify.success(message);
  onCallback(true, false, afterSubmit, props);
}

function onShowError(action, data, error, props) {
  const { showConfirmErrorBeforeSubmit, confirmErrorMessageBeforeSubmit } =
    action;
  if (showConfirmErrorBeforeSubmit) {
    Confirm.error({
      content: confirmErrorMessageBeforeSubmit,
    });
    onCallback(false, true, null, props);
    return;
  }
  const { submitErrorMsg } = action;
  const { data: responseData } = (error || {}).response || error || {};
  const realError =
    responseData?.reason || responseData?.message || responseData || error;
  const message = submitErrorMsg
    ? submitErrorMsg(data, realError)
    : getDefaultMsg(action, data).submitErrorMsg;

  Notify.errorWithDetail(realError, message);
  onCallback(false, true, null, props);
}

function onCallback(success, fail, afterSubmit, props) {
  const { onFinishAction, id } = props;
  if (onFinishAction) {
    const isDelete = id === 'delete';
    setTimeout(() => {
      onFinishAction(success, fail, isDelete, afterSubmit);
    }, 500);
  }
}

const ActionButton = (props) => {
  const {
    id,
    actionType,
    action,
    item,
    containerProps,
    isAllowed,
    needHide,
    buttonType,
    buttonClassName,
    name,
    title,
    danger,
    style,
    items,
    isBatch,
    combineBatch,
    onFinishAction,
    isMoreAction,
  } = props;

  const [visible, setVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { routing } = useRootStore();

  if (!id) {
    throw Error('need id!');
  }

  if (!isAllowed && needHide) {
    return null;
  }

  const handleCallback = (success, fail, afterSubmit) => {
    if (onFinishAction) {
      const isDelete = id === 'delete';
      setTimeout(() => {
        onFinishAction(success, fail, isDelete, afterSubmit);
      }, 500);
    }
  };

  const onShowConfirm = async () => {
    const {
      perform,
      title: confirmTitle,
      confirmContext,
      okText,
      cancelText,
      onSubmit,
      width,
      afterSubmit,
    } = action;

    let data = isBatch ? items : item;
    if (combineBatch) {
      data = items;
    }
    const content = confirmContext
      ? await confirmContext(data)
      : getDefaultMsg(action, data).confirmContext;

    const onConfirmOK = (modal) => {
      if (isBatch) {
        return onSubmitBatch(
          action,
          data,
          onSubmit,
          containerProps,
          isBatch,
          afterSubmit,
          props
        ).catch(() => {
          modal &&
            modal.update({
              visible: false,
            });
        });
      }

      return onSubmitOne(
        action,
        data,
        onSubmit,
        containerProps,
        afterSubmit,
        props
      );
    };

    try {
      perform(data).then(
        () => {
          const modal = Confirm.confirm({
            title: confirmTitle,
            content,
            width,
            okText,
            cancelText,
            onOk: () => onConfirmOK(modal),
            onCancel() {},
          });
        },
        (error) => {
          const message = error || getDefaultMsg(action, data).performErrorMsg;
          Confirm.error({
            content: message,
          });
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      const message = error || getDefaultMsg(action, data).performErrorMsg;
      Confirm.error({
        content: message,
      });
    }
  };

  const handleButtonClick = () => {
    switch (actionType) {
      case 'notice':
        if (action.checkNotice(item)) {
          setVisible(true);
        }
        break;
      case 'confirm':
        onShowConfirm();
        break;
      case 'link': {
        const { path } = action;
        if (isFunction(path)) {
          const newPath = path(item, containerProps);
          routing.push(newPath);
        } else {
          routing.push(path);
        }
        break;
      }
      case 'terminal': {
        action.openTerminal(item);
        break;
      }
      default:
        setVisible(true);
    }
  };

  const onCloseModal = () => setVisible(false);

  const onSubmitLoading = (flag) => setSubmitLoading(!!flag);

  return (
    <>
      <Button
        type={buttonType}
        danger={danger}
        onClick={handleButtonClick}
        key={id}
        disabled={!isAllowed}
        className={buttonClassName}
        style={style}
        block={isMoreAction}
      >
        {name || title}
      </Button>
      <ActionModal
        title={title}
        visible={visible}
        submitLoading={submitLoading}
        action={action}
        item={item}
        items={items}
        containerProps={containerProps}
        onClose={onCloseModal}
        onSubmitLoading={onSubmitLoading}
        onCallback={handleCallback}
      />
    </>
  );
};

ActionButton.propTypes = {
  title: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  // perform: PropTypes.func.isRequired,
  item: PropTypes.object,
  actionType: PropTypes.string,
  isAllowed: PropTypes.bool,
  needHide: PropTypes.bool,
  buttonType: PropTypes.string,
  items: PropTypes.array,
  isBatch: PropTypes.bool,
  path: PropTypes.string,
  onFinishAction: PropTypes.func,
  action: PropTypes.any,
  containerProps: PropTypes.any,
  isMoreAction: PropTypes.bool,
};
ActionButton.defaultProps = {
  item: undefined,
  isAllowed: false,
  needHide: true,
  buttonType: 'link',
  items: [],
  isBatch: false,
  path: '',
  containerProps: {},
  isMoreAction: false,
};

export default ActionButton;
