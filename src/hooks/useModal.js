import React, {
  useRef,
  useMemo,
  memo,
  forwardRef,
  useCallback,
  useState,
  useImperativeHandle,
} from 'react';
import { Modal, Form } from 'antd';

const ModalComponent = memo(
  forwardRef((prop, ref) => {
    const [form] = Form.useForm();
    const [modalChildren, setModalChildren] = useState(null);
    const [modalProps, setModalProps] = useState({ visible: false });
    const typeRef = useRef();

    const onFinish = useCallback(
      (values) => {
        modalProps.onOk?.(values);
      },
      [form, modalProps]
    );

    const onClose = useCallback(() => {
      setModalProps((source) => ({
        ...source,
        visible: false,
      }));
      modalProps.onClose?.();
    }, [form, modalProps]);

    const onOpen = useCallback(() => {
      setModalProps((source) => ({
        ...source,
        visible: true,
      }));
    }, [form]);

    useImperativeHandle(
      ref,
      () => ({
        injectChildren: (element) => {
          setModalChildren(element);
        },
        injectModalProps: (props) => {
          setModalProps((source) => ({
            ...source,
            ...props,
          }));
        },
        open: () => {
          onOpen();
        },
        close: () => {
          onClose();
        },
        setFieldsValue: (values) => {
          form.setFieldsValue?.(values);
        },
        setType: (type) => {
          typeRef.current = type;
        },
      }),
      []
    );

    const handleOk = useCallback(() => {
      if (typeRef.current === 'form') {
        form.submit();
      } else {
        modalProps.onOk?.(null);
      }
    }, [form, modalProps]);

    return (
      <Modal {...modalProps} onCancel={onClose} onOk={handleOk}>
        {modalChildren
          ? React.cloneElement(modalChildren, {
              onFinish,
              form,
              onClose,
            })
          : null}
      </Modal>
    );
  })
);

export default () => {
  const modalRef = useRef();

  const handle = useMemo(
    () => ({
      open: ({ children, type = 'form', initialValues, ...rest }) => {
        modalRef.current.setType(type);
        modalRef.current.injectChildren(children);
        modalRef.current.injectModalProps(rest);
        modalRef.current.open();

        if (initialValues && type === 'form') {
          modalRef.current.setFieldsValue?.(initialValues);
        }
      },
      close: () => {
        modalRef.current.close();
      },
    }),
    []
  );

  return [handle, <ModalComponent ref={modalRef} />];
};
