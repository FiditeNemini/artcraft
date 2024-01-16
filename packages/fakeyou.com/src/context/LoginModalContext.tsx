import { createContext } from 'react';

interface LoginModalContext { show: boolean, close: () => void, open: () => void }

export default createContext<LoginModalContext>({
	show: false,
	close: () => {},
	open: () => {}
});