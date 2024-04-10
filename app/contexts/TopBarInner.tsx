import { createContext } from "react";

export const TopBarInnerContext = createContext<{
  TopBarInner: {
    location: string,
    node: React.ReactNode,
  } | null;
  setTopBarInner: (el: {
    location: string,
    node: React.ReactNode,
  } | null)=>void;
} | null>(null);
