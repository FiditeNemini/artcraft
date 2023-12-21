import { createContext } from "react";

interface SessionContextType {
	sessionFetched: boolean,
	sessionWrapper?: any
}

export default createContext<SessionContextType>({
	sessionFetched: false
});