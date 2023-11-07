import { createContext } from "react";

interface SessionContextType {
	sessionWrapper?: any
}

export default createContext<SessionContextType>({});