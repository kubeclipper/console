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
import React, { forwardRef } from 'react';
import { isFunction, has, isObject, isEmpty, isArray } from 'lodash';
import Notify from 'components/Notify';
import { Row, Col, Form, Button, Spin, Card, Alert } from 'antd';
import FormItem from 'components/FormItem';
import classnames from 'classnames';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import PropTypes from 'prop-types';
import FORM_TEMPLATES from 'utils/form.templates';

export const Forms = forwardRef((props, ref) => {
  const {
    formItems = [],
    labelCol,
    wrapperCol,
    name,
    initialValues,
    onValuesChange,
    labelAlign = 'left',
  } = props;

  const renderFormItems = (items) =>
    items.map((it, index) => {
      const { colNum, hidden } = it;
      if (typeof hidden === 'boolean' && hidden) {
        return '';
      }

      return (
        <Col
          span={24 / (colNum || 1)}
          key={`form-item-col-${index}`}
          id={`form-item-col-${it.name}`}
        >
          <FormItem
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            {...it}
            key={`form-item-${index}`}
          />
        </Col>
      );
    });

  const renderDeepFormItems = () => {
    const isDeep = formItems.some((i) => Array.isArray(i));

    if (isDeep) {
      return formItems.map((it, index) => (
        <Card key={index}>
          <Row>{renderFormItems(it)}</Row>
        </Card>
      ));
    }

    return <Row>{renderFormItems(formItems)}</Row>;
  };

  return (
    <Form
      ref={ref}
      colon={false}
      labelAlign={labelAlign}
      name={name}
      initialValues={initialValues}
      onValuesChange={onValuesChange}
    >
      {renderDeepFormItems()}
    </Form>
  );
});

export default class BaseForm extends React.Component {
  static propTypes = {
    context: PropTypes.object,
    goStep: PropTypes.func,
    location: PropTypes.object,
    match: PropTypes.object,
    updateContext: PropTypes.func,
  };

  static defaultProps = {
    context: {},
    goStep: () => {},
    location: {},
    match: {},
    updateContext: () => {},
  };

  constructor(props, options = {}) {
    super(props);

    this.options = options;

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      defaultValue: {},
      // eslint-disable-next-line react/no-unused-state
      formData: {},
      // eslint-disable-next-line react/no-unused-state
      isPrev: false,
    };

    this.values = {};
    this.formRef = React.createRef();

    this.init();
  }

  // eslint-disable-next-line react/sort-comp
  init() {
    this.store = {};
  }

  componentDidMount() {
    this.updateDefaultValue();
    this.updateState();
  }

  componentWillUnmount() {
    this.unsubscribe?.();
    this.disposer?.();
    this.unMountActions?.();
  }

  checkContextValue() {
    const { context } = this.props;
    const names = this.nameForStateUpdate;
    if (isEmpty(context)) {
      return false;
    }
    const item = names.find((name) => has(context, name));
    return !!item;
  }

  updateState() {
    // save linkage data to state
    const { context } = this.props;
    const names = this.nameForStateUpdate;
    if (names.length === 0) {
      return;
    }
    const newState = {};
    if (this.checkContextValue()) {
      names.forEach((name) => {
        newState[name] = this.getChangedFieldsValue(context, name);
      });
    } else {
      names.forEach((name) => {
        newState[name] = this.getChangedFieldsValue(this.defaultValue, name);
      });
    }
    this.setState({
      ...newState,
    });
  }

  // eslint-disable-next-line react/sort-comp
  get module() {
    return '';
  }

  get labelAlign() {
    return 'right';
  }

  get authKey() {
    return this.module;
  }

  get name() {
    return '';
  }

  get title() {
    return '';
  }

  get className() {
    return '';
  }

  get prefix() {
    return this.props.match.url;
  }

  get routing() {
    return this.props.rootStore.routing;
  }

  get params() {
    return this.props.match.params || {};
  }

  get listUrl() {
    return '/base/tmp';
  }

  get isStep() {
    return false;
  }

  get isModal() {
    return false;
  }

  get isFormRender() {
    return false;
  }

  get formRenderRefs() {
    return this.props?.context?.refs || [];
  }

  get labelCol() {
    return {
      xs: { span: 5 },
      sm: { span: 3 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 10 },
      sm: { span: 8 },
    };
  }

  get defaultValue() {
    return null;
  }

  get formDefaultValue() {
    const { context = {} } = this.props;
    const { defaultValue } = this;

    return {
      ...defaultValue,
      ...context,
    };
  }

  get formTemplate() {
    return FORM_TEMPLATES[this.module]();
  }

  get okBtnText() {
    return t('Confirm');
  }

  get successText() {
    return t('{name} successfully.', { name: this.name });
  }

  get errorText() {
    return t('Unable to {name}.', { name: this.name });
  }

  get isSubmitting() {
    return this.store?.isSubmitting || false;
  }

  get formItems() {
    return [];
  }

  get validateMessages() {
    return [];
  }

  get alert() {
    return '';
  }

  get tips() {
    return '';
  }

  getFormInstance = () => this.formRef.current;

  // eslint-disable-next-line no-unused-vars
  onSubmit = (values) => Promise.resolve();

  successCallback = () => {};

  errorMessage = (err) => (
    <p>
      {this.errorText}
      <br />
      {err.reason}
    </p>
  );

  onOk = (values, containerProps, callback) => {
    // eslint-disable-next-line no-console
    // console.log('onOk', values);
    this.values = values;
    return this.onSubmit(values, containerProps).then(
      () => {
        !this.isModal && this.routing.push(this.listUrl);

        if (callback && isFunction(callback)) {
          callback(true, false);
        }

        Notify.success(this.successText);
        this.successCallback({ values });
      },
      (err) => {
        Notify.error(this.errorMessage(err));
        // eslint-disable-next-line no-console
        console.log(err);
      }
    );
  };

  onCancel = () => {};

  updateContext = (allFields) => {
    this.props.updateContext(allFields);
  };

  get nameForStateUpdate() {
    const typeList = ['radio', 'select', 'check', 'textarea', 'more'];
    return this.formItems
      .filter((it) => typeList.indexOf(it.type) >= 0)
      .map((it) => it.name);
  }

  getChangedFieldsValue = (changedFields, name) => {
    const value = changedFields[name];
    if (isObject(value) && value.value) {
      return value.value;
    }
    if (isObject(value) && value.selectedRows) {
      return value.selectedRows[0];
    }
    return value;
  };

  // eslint-disable-next-line no-unused-vars
  onValuesChange = (changedFields, allFields) => {
    // save linkage data to state
    this.nameForStateUpdate.forEach((name) => {
      if (has(changedFields, name)) {
        this.setState({
          [name]: this.getChangedFieldsValue(changedFields, name),
        });
      }
    });
  };

  checkFormRenderInput = async () => {
    let isError = false;
    const values = this.formRef.current.getFieldValue();
    const currentInstance = values[this.name]?.currentForms;

    if (!currentInstance) {
      return {
        isError: false,
      };
    }

    if (isArray(currentInstance)) {
      for (const item of currentInstance) {
        if (item.formData.enable) {
          // eslint-disable-next-line no-await-in-loop
          const errfields = await item.submit();
          errfields.length && (isError = true);
        }
      }
    } else {
      const errfields = await currentInstance.submit();
      errfields.length && (isError = true);
    }

    return {
      isError,
      values,
    };
  };

  checkFormInput = (callback, failCallback, isPrev) => {
    // eslint-disable-next-line react/no-unused-state
    this.setState({ isPrev: !!isPrev }, function () {
      this.formRef.current
        .validateFields()
        .then((values) => {
          callback && callback(values);
          this.updateContext(values);
        })
        .catch(({ values, errorFields }) => {
          if (errorFields && errorFields.length) {
            failCallback && failCallback(values, errorFields);
          } else {
            // eslint-disable-next-line no-console
            console.log('checkFormInput-catch', values, errorFields);
            // callback && callback(values);
          }
        });
    });
  };

  checkFormInputForAsync = async (isPrev) => {
    // eslint-disable-next-line react/no-unused-state
    await this.setState({ isPrev: !!isPrev });
    try {
      const validValues = await this.formRef.current.validateFields();
      await this.updateContext(validValues);
      return Promise.resolve(validValues);
    } catch (err) {
      const { errorFields } = err;
      if (errorFields?.length) {
        return Promise.reject(err);
      }
    }
  };

  updateDefaultValue = () => {
    this.formRef.current?.resetFields();
    this.updateContext(this.defaultValue);
  };

  updateFormValue = (key, value) => {
    this.formRef.current?.setFieldsValue({
      [key]: value,
    });
  };

  onClickSubmit = async (callback, checkCalback, containerProps) => {
    this.checkFormInput(async (values) => {
      checkCalback && checkCalback();
      await this.onOk(values, containerProps, callback);
    });
  };

  onClickCancel = () => {
    this.routing.push(this.listUrl);
  };

  renderAlert() {
    if (this.alert) {
      return (
        <div className={styles.alert}>
          <Alert {...this.alert} />
        </div>
      );
    }
  }

  renderTips() {
    if (this.tips) {
      return (
        <div className={styles.tips}>
          <InfoCircleOutlined className={styles['tips-icon']} />
          {this.tips}
        </div>
      );
    }
    return null;
  }

  renderFooterLeft() {
    return null;
  }

  renderFooter() {
    if (this.isStep || this.isModal || this.isSubmitting) {
      return null;
    }

    return (
      <div className={styles.footer}>
        <div className={styles['footer-left']}>{this.renderFooterLeft()}</div>
        <div className={styles.btns}>
          <Button onClick={this.onClickCancel} loading={this.isSubmitting}>
            {t('Cancel')}
          </Button>
          <Button
            type="primary"
            onClick={this.onClickSubmit}
            loading={this.isSubmitting}
          >
            {this.okBtnText}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className={classnames(styles.wrapper, this.className)}>
        <Spin spinning={this.isSubmitting}>
          {this.renderAlert()}
          {this.renderTips()}
          <div className={classnames(styles.form, 'base-form')}>
            <Forms
              ref={this.formRef}
              formItems={this.formItems}
              labelCol={this.labelCol}
              wrapperCol={this.wrapperCol}
              labelAlign={this.labelAlign}
              name={this.name}
              initialValues={this.formDefaultValue}
              onValuesChange={this.onValuesChange}
            />
          </div>
          {this.renderFooter()}
        </Spin>
      </div>
    );
  }
}
