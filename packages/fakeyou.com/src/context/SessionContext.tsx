import { createContext } from "react";

interface SessionContextType {
	querySession?: any,
	sessionFetched: boolean,
	sessionWrapper?: any
}

export default createContext<SessionContextType>({
	sessionFetched: false
});