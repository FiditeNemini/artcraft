import React, { useState } from 'react';
import { AccountModalContext } from 'context';
import { useSession } from "hooks";
import { Modal } from "components/common";
import AccountModal from "components/layout/AccountModal";
import { ModalView } from "context/AccountModalContext";

interface Props {
  children?: any;
}

export default function AccountModalProvider({ children }: Props) {
  const { user } = useSession();
  const [view,viewSet] = useState(ModalView.Closed);
	const open = () => viewSet(ModalView.Signup);
	const close = () => { viewSet(ModalView.Closed); console.log("🍏",);};
  const viewSwitch = () => view === ModalView.Signup ? viewSet(ModalView.Login) : viewSet(ModalView.Signup);
  const sessionCheck = () => {
    if (user) {
      return true;
    } else {
      open();
      return false;
    }
  };

    return <AccountModalContext.Provider {...{ value: { view, close, open, sessionCheck } }}>
      {children}
      {
      	<Modal {...{
          content: AccountModal,
          contentProps: { view, viewSwitch },
      		handleClose: close,
      		noHeader: true,
      		show: view > 0,
      		showButtons: false,
      		// title: "You need to login",
      	}}/>
      }
    </AccountModalContext.Provider>;
};
