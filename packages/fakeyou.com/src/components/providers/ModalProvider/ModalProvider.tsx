import React, { useState } from "react";
import { ModalContext } from "context";
import { Modal } from "components/common";

interface Props {
  children?: any;
}

interface ModalConfig {
  component: React.ElementType;
  props?: any;
}

export default function ModalProvider({ children }: Props) {
  const [modalState, modalStateSet] = useState<ModalConfig | null>(null);
  const open = (cfg: ModalConfig) => modalStateSet(cfg);
  const close = () => modalStateSet(null);

  return (
    <ModalContext.Provider {...{ value: { close, open, modalState } }}>
      {children}
      {
        <Modal
          {...{
            large: true,
            className: "fy-core-modal",
            content: modalState?.component,
            contentProps: modalState?.props,
            handleClose: close,
            noHeader: true,
            omitBody: true,
            show: !!modalState?.component,
            showButtons: false,
            mobileFullscreen: true,
          }}
        />
      }
    </ModalContext.Provider>
  );
}
