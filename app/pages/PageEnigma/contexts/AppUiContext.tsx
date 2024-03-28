import { createContext, Dispatch, ReactNode } from "react";
import { AppUiState, AppUiAction } from "../reducers";

export const AppUiContext = createContext<[
  AppUiState | null,
  Dispatch<AppUiAction>
]>([ null ,()=>{}]);

export const AppUIProvider = ({
  value,
  children,
}:{
  value:[AppUiState, Dispatch<AppUiAction>],
  children: ReactNode
})=>{
  return (
    <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>
  );
}