import React from 'react';
import NotFound from 'components/NotFound';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // eslint-disable-next-line no-console
    console.log('ErrorBoundary', error);
    return {
      hasError: true,
      error,
    };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidCatch(error, errorInfo) {}

  render() {
    const { formError, children } = this.props;

    if (this.state.hasError) {
      return (
        <NotFound
          codeError
          title={formError ? t('form') : t('data')}
          link={formError ? false : '/'}
        />
      );
    }

    return children;
  }
}
