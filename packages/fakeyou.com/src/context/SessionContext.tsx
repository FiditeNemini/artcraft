import { createContext } from "react";

interface SessionContextType {
	querySession?: any,
	querySubscriptions?: any,
	sessionFetched: boolean,
	sessionWrapper?: any
}

export default createContext<SessionContextType>({
	sessionFetched: false
});