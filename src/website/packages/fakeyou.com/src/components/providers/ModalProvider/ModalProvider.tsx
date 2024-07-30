import React, { createContext, useEffect, useState } from "react";

import ModalLayer from "./ModalLayer";
import { isMobile } from "react-device-detect";

interface ModalProviderProps {
  children?: any;
}

export interface ModalConfig {
  component: React.ElementType;
  lockTint?: boolean;
  props?: any;
}

export interface ModalContextShared {
  close: () => void;
  modalOpen: boolean;
  modalState: ModalConfig | null;
  open: (cfg: ModalConfig) => void;
}

export const ModalContext = createContext<ModalContextShared>({
  close: () => {},
  open: () => {},
  modalOpen: false,
  modalState: null,
});

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
    // Prevent body scrolling when modal is open on mobile
    if (modalOpen && isMobile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

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
          close,
          killModal,
          lockTint: modalState?.lockTint,
          modalOpen,
          onModalCloseEnd,
        }}
      />
    </ModalContext.Provider>
  );
}
