import { createContext } from 'react';

export enum ModalView {
  Closed,
  Signup,
  Login
}

interface ModalConfig {
  component: React.ElementType,
  props?: any
}

interface AccountModalContext { close: () => void, modalState: ModalConfig | null, open: (comp: any) => void  }

export default createContext<AccountModalContext>({
	close: () => {},
	open: () => {},
	modalState: null,
});