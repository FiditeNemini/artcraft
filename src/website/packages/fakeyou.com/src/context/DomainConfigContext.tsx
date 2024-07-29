import React, { createContext, useContext, ReactNode } from "react";
import { GetWebsite } from "@storyteller/components/src/env/GetWebsite";

const DomainConfigContext = createContext(GetWebsite());

export const useDomainConfig = () => useContext(DomainConfigContext);

interface DomainConfigProviderProps {
  children: ReactNode;
}

export default function DomainConfigProvider({
  children,
}: DomainConfigProviderProps) {
  const domainConfig = GetWebsite();

  return (
    <DomainConfigContext.Provider value={domainConfig}>
      {children}
    </DomainConfigContext.Provider>
  );
}
