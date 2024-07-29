import React, { createContext } from "react";

interface SessionContextType {
 cachedComponent: any,
}

export default createContext<SessionContextType>({
  cachedComponent: () => <></>
});