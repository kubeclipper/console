import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidCatch(error, errorInfo) {}

  renderError() {
    return { __html: this.state.error.replace(/\\n/g, '<br/>') };
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div style={{ padding: '10px' }}>
          <h1>Something went wrong.</h1>
          <p
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={this.renderError()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
