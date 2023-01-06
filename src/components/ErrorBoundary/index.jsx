/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NotFound from 'components/NotFound';

function ErrorBoundary({ children, ...rest }) {
  const [hasError, setHasError] = useState(false);
  const location = useLocation();
  // fix err, router not work
  useEffect(() => {
    if (hasError) {
      setHasError(false);
    }
  }, [location.key]);

  return (
    <ErrorBoundaryInner hasError={hasError} setHasError={setHasError} {...rest}>
      {children}
    </ErrorBoundaryInner>
  );
}

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidUpdate(prevProps, _previousState) {
    if (!this.props.hasError && prevProps.hasError) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(_error, _errorInfo) {
    // eslint-disable-next-line no-console
    console.table('error', _error);
    this.props.setHasError(true);
  }

  render() {
    return this.state.hasError ? (
      <NotFound
        codeError
        title={this.props.formError ? t('form') : t('data')}
        link={this.props.formError ? false : '/'}
      />
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
