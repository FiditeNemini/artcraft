import { ReactNode, createContext } from "react";

export const TopBarInnerContext = createContext<{
  TopBarInner: JSX.Element | null;
  setTopBarInner: (el: JSX.Element | null)=>void;
} | null>(null);