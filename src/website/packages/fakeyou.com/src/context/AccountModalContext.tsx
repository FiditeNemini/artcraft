import { createContext } from 'react';

export enum ModalView {
  Closed,
  Signup,
  Login
}

interface AccountModalContext { close: () => void, open: () => void, sessionCheck: () => boolean, view: ModalView,  }

export default createContext<AccountModalContext>({
	close: () => {},
	open: () => {},
	sessionCheck: () => false,
	view: ModalView.Closed,
});