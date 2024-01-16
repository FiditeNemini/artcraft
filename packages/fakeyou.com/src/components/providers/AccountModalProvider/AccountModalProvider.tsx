import React, { useState } from 'react';
import { AccountModalContext } from 'context';
import { Modal } from "components/common";
import AccountModal from "components/layout/AccountModal";

interface Props {
  children?: any;
}


export default function AccountModalProvider({ children }: Props) {
	const [show, showSet] = useState(false);
	const open = () => showSet(true);
	const close = () => { showSet(false); console.log("🍏",);};

    return <AccountModalContext.Provider {...{ value: { show, close, open } }}>
      {children}
      {
      	<Modal {...{
      		// content: () => <div>hiiiii</div>,
      		handleClose: close,
      		noHeader: true,
      		show,
      		showButtons: false,
      		content: AccountModal
      		// title: "You need to login",
      	}}/>
      }
    </AccountModalContext.Provider>;
};
