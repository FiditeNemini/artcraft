import { createContext, Dispatch, ReactNode } from "react";
import { State, Action } from "../reducer";

export const AppUiContext = createContext<[State|null, Dispatch<Action>|null]>([null,null]);

export const AppUIProvider = ({
  value,
  children,
}:{
  value:[State, Dispatch<Action>],
  children: ReactNode
})=>{
  return (
    <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>
  );
}