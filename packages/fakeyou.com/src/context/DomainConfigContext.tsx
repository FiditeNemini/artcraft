import React, { createContext, useContext, ReactNode } from "react";
import { getCurrentDomainConfig } from "../utils/domainConfig";

const DomainConfigContext = createContext(getCurrentDomainConfig());

export const useDomainConfig = () => useContext(DomainConfigContext);

interface DomainConfigProviderProps {
  children: ReactNode;
}

export default function DomainConfigProvider({
  children,
}: DomainConfigProviderProps) {
  const domainConfig = getCurrentDomainConfig();

  return (
    <DomainConfigContext.Provider value={domainConfig}>
      {children}
    </DomainConfigContext.Provider>
  );
}
