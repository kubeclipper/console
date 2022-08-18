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
import { cloneDeep, isEmpty } from 'lodash';
import Notify from 'components/Notify';
import { Spin } from 'antd';
import classnames from 'classnames';
import { firstUpperCase } from 'utils/index';
import { parse } from 'qs';
import { rootStore } from 'stores';
import styles from './index.less';

import Steps from './steps';
import Footer from './footer';

export default class BaseStepForm extends React.Component {
  constructor(props, options = {}) {
    super(props);

    this.options = options;

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      formTemplate: cloneDeep(this.formTemplate),
      current: 0,
      data: {},
    };

    this.stepHandle = {
      onClickPrev: this.onClickPrev,
      onClickNext: this.onClickNext,
      onClickCancel: this.onClickCancel,
      onClickSubmit: this.onClickSubmit,
      onClickCreateQuickly: this.onClickCreateQuickly,
    };

    this.values = {};
    this.setFormRefs();
    this.init();
  }

  get hasConfirmStep() {
    return false;
  }

  get name() {
    return '';
  }

  get isCreateQuickly() {
    return false;
  }

  get title() {
    return `${this.name}s`;
  }

  get className() {
    return '';
  }

  get prefix() {
    return this.props.match.url;
  }

  get routing() {
    return rootStore.routing;
  }

  get location() {
    return this.props.location || {};
  }

  get locationParams() {
    return parse(this.location.search.slice(1));
  }

  get match() {
    return this.props.match || {};
  }

  get listUrl() {
    return '/base/tmp';
  }

  get currentUser() {
    const { user } = this.props.rootStore || {};
    return user || {};
  }

  get labelCol() {
    return {
      xs: { span: 4 },
      sm: { span: 2 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 16 },
      sm: { span: 12 },
    };
  }

  get steps() {
    return [];
  }

  get formTemplate() {
    return {};
  }

  get okBtnText() {
    return t('Confirm');
  }

  get instanceName() {
    const { name } = this.values || {};
    return name;
  }

  get successText() {
    if (this.instanceName) {
      return firstUpperCase(
        t('{name} {action} successfully.', {
          action: this.name.toLowerCase(),
          name: this.instanceName,
        })
      );
    }
    return firstUpperCase(
      t('{action} successfully.', {
        action: this.name.toLowerCase(),
      })
    );
  }

  get errorText() {
    if (this.instanceName) {
      return t('Unable to {action} {name}.', {
        action: this.name.toLowerCase(),
        name: this.instanceName,
      });
    }
    return t('Unable to {action}.', {
      action: this.name.toLowerCase(),
    });
  }

  get isSubmitting() {
    return this.store?.isSubmitting || false;
  }

  get isLoading() {
    if (this.hasExtraProps && isEmpty(this.state.extra)) {
      return true;
    }
    return false;
  }

  get currentComponent() {
    const { current } = this.state;
    return this.steps[current].component;
  }

  get currentRef() {
    const { current } = this.state;
    return this.formRefs[current];
  }

  get currentRefInstance() {
    return this.currentRef?.current;
  }

  setFormRefs() {
    this.formRefs = this.steps.map(() => React.createRef());
  }

  getUrl(path) {
    return path;
  }

  // eslint-disable-next-line no-unused-vars
  onSubmit = (values) => Promise.resolve();

  onOk = () => {
    const { data } = this.state;
    // eslint-disable-next-line no-console
    console.log('onOk', data);
    this.values = data;
    const submitData = this.getSubmitData(data);
    this.onSubmit(submitData).then(
      () => {
        this.routing.push(this.listUrl);
        Notify.success(this.successText);
      },
      (err) => {
        this.responseError = err;

        Notify.error(err.reason);
      }
    );
  };

  getSubmitData(data) {
    return { ...data };
  }

  updateDataOnPrev = (values) => {
    this.updateData(values, () => {
      // const current = this.state.current - 1;
      this.setState((pre) => ({ current: pre.current - 1 }));
    });
  };

  updateData = (values, callback) => {
    const { data } = this.state;
    this.setState(
      {
        data: {
          ...data,
          ...values,
        },
      },
      () => {
        callback?.();
      }
    );
  };

  goStep = (index) => {
    this.setState({
      current: index,
    });
  };

  onClickPrev = () => {
    if (!this.currentRefInstance) {
      this.updateDataOnPrev();
      return;
    }

    this.currentRefInstance.checkFormInput(
      this.updateDataOnPrev,
      this.updateDataOnPrev,
      true
    );
  };

  onClickNext = async () => {
    const { isFormRender, checkFormRenderInput, checkFormInput } =
      this.currentRefInstance;

    if (isFormRender) {
      const { isError, values } = await checkFormRenderInput();
      if (!isError) {
        values && this.updateData(values);
        this.setState((prev) => ({ current: prev.current + 1 }));
      }
    } else {
      checkFormInput((values) => {
        this.updateData(values);
        this.setState((prev) => ({ current: prev.current + 1 }));
      });
    }
  };

  onClickNextForAsync = async () => {
    const { isFormRender, checkFormRenderInput, checkFormInputForAsync } =
      this.currentRefInstance;

    if (isFormRender) {
      const { isError, values } = await checkFormRenderInput();
      if (isError) {
        return Promise.reject(isError);
      } else {
        await this.updateData(values);
        await this.setState((prev) => ({ current: prev.current + 1 }));
        return Promise.resolve();
      }
    } else {
      try {
        const values = await checkFormInputForAsync();
        await this.updateData(values);

        await this.setState((prev) => ({ current: prev.current + 1 }));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };

  onClickCreateQuickly = async () => {
    const lastLength = this.steps.length - 1 - this.state.current;
    for (let i = 0; i < lastLength; i++) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.onClickNextForAsync();
      if (result) break;
    }
  };

  onClickSubmit = () => {
    if (!this.hasConfirmStep) {
      this.currentRef.current.checkFormInput((values) => {
        this.updateData(values, this.onOk);
      });
      return;
    }
    this.onOk();
  };

  onClickCancel = () => {
    this.routing.push(this.listUrl);
  };

  init() {
    this.store = {};
  }

  renderForms() {
    const Component = this.currentComponent;
    const { data } = this.state;

    return (
      <div className={classnames(styles.form, 'form')}>
        <Component
          ref={this.currentRef}
          context={data}
          updateContext={this.updateData}
          goStep={this.goStep}
          match={this.match}
          location={this.location}
        />
      </div>
    );
  }

  render() {
    const { current, data } = this.state;
    return (
      <div className={classnames(styles.wrapper, this.className)}>
        <Spin spinning={this.isSubmitting}>
          <Steps current={current} steps={this.steps} />
          {this.renderForms()}
          <Footer
            current={current}
            steps={this.steps}
            handle={this.stepHandle}
            isCreateQuickly={this.isCreateQuickly}
            useTemplate={data?.useTemplate}
          />
        </Spin>
      </div>
    );
  }
}
