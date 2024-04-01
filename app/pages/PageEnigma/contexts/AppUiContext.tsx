import { createContext, Dispatch, ReactNode, useReducer } from "react";
import {
  AppUiState,
  AppUiAction,
  appUiReducer,
  appUiInitialStateValues,
} from "../reducers";

export const AppUiContext = createContext<[AppUiState, Dispatch<AppUiAction>]>([
  appUiInitialStateValues,
  () => {},
]);

export const AppUIProvider = ({ children }: { children: ReactNode }) => {
  const value = useReducer(appUiReducer, appUiInitialStateValues);

  return (
    <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>
  );
};
