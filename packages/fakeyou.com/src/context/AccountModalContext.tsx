import { createContext } from 'react';

interface AccountModalContext { show: boolean, close: () => void, open: () => void }

export default createContext<AccountModalContext>({
	show: false,
	close: () => {},
	open: () => {}
});