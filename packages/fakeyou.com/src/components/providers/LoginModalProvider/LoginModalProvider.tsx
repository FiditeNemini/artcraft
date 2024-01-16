import React, { useState } from 'react';
import { LoginModalContext } from 'context';
import { Modal } from "components/common";
import LoginModal from "components/layout/LoginModal";

interface Props {
  children?: any;
}


export default function LoginModalProvider({ children }: Props) {
	const [show, showSet] = useState(false);
	const open = () => showSet(true);
	const close = () => { showSet(false); console.log("🍏",);};

    return <LoginModalContext.Provider {...{ value: { show, close, open } }}>
      {children}
      {
      	<Modal {...{
      		// content: () => <div>hiiiii</div>,
      		handleClose: close,
      		noHeader: true,
      		show,
      		showButtons: false,
      		content: LoginModal
      		// title: "You need to login",
      	}}/>
      }
    </LoginModalContext.Provider>;
};
