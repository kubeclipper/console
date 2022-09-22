// TODO add svg sprite; expect to use icon by <Icon name='success' />
import React from 'react';
import Icon from '@ant-design/icons';

const SuccessSvg = () => (
  <svg
    t="1664187984816"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="1615"
    width="16"
    height="16"
  >
    <path
      d="M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z"
      fill="#07C160"
      p-id="1616"
    />
    <path
      d="M466.7 679.8c-8.5 0-16.6-3.4-22.6-9.4l-181-181.1c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l158.4 158.5 249-249c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L489.3 670.4c-6 6-14.1 9.4-22.6 9.4z"
      fill="#FFFFFF"
      p-id="1617"
    />
  </svg>
);

const ErrorSvg = () => (
  <svg
    t="1664182863831"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="1476"
    width="16"
    height="16"
  >
    <path
      d="M512 85.333333c235.648 0 426.666667 191.018667 426.666667 426.666667s-191.018667 426.666667-426.666667 426.666667S85.333333 747.648 85.333333 512 276.352 85.333333 512 85.333333z m181.034667 185.301334L512 451.669333 330.965333 270.634667 270.634667 330.965333 451.669333 512l-181.034666 181.034667 60.330666 60.330666L512 572.330667l181.034667 181.034666 60.330666-60.330666L572.330667 512l181.034666-181.034667-60.330666-60.330666z"
      fill="#EC5F56"
      p-id="1477"
    />
  </svg>
);

export const SuccessIcon = (props) => (
  <Icon component={SuccessSvg} {...props} />
);
export const ErrorIcon = (props) => <Icon component={ErrorSvg} {...props} />;
