import React, { useEffect, useState } from "react";
import { ModalContext } from "context";

import ModalLayer from "./ModalLayer";

interface ModalProviderProps {
  children?: any;
}

export interface ModalConfig {
  component: React.ElementType;
  props?: any;
}

// how this works
//
// When modalState is set via open(), modalOpen is set to true to via useEffect
// this is to separate modal rendering (modalOpen) from its state (modalState) to achieve smooth transitions.
//
// When close() is run, modalOpen is set to false triggering a ModalLayer transition,
// and killModal is set to true to indicate an exiting transition.
// When the transition is complete onModalCloseEnd() runs, and because killModal is true
// modalState will be cleared, ensuring the state is cleared only when the modal is no longer rendered.

export default function ModalProvider({ children }: ModalProviderProps) {
  const [modalState, modalStateSet] = useState<ModalConfig | null>(null);
  const [modalOpen, modalOpenSet] = useState(false);
  const [killModal, killModalSet] = useState(false);
  const open = (cfg: ModalConfig) => modalStateSet(cfg);
  const close = () => {
    modalOpenSet(false);
    killModalSet(true);
  };
  const onModalCloseEnd = () => {
    if (killModal && modalState) {
      killModalSet(false);
      modalStateSet(null);
    }
  };

  useEffect(() => {
    if (!killModal && modalState && !modalOpen) {
      modalOpenSet(true);
    }
  }, [killModal, modalOpen, modalState]);

  return (
    <ModalContext.Provider
      {...{ value: { close, open, modalOpen, modalState } }}
    >
      {children}
      <ModalLayer
        {...{
          content: modalState?.component,
          contentProps: modalState?.props,
          handleClose: close,
          killModal,
          modalOpen,
          modalState,
          onModalCloseEnd,
        }}
      />
    </ModalContext.Provider>
  );
}
