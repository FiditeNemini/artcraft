import { createContext, Dispatch, SetStateAction } from "react";
import { AuthState, AUTH_STATUS } from "./types";

export const AuthenticationContext = createContext<{
  authState: AuthState,
  setAuthState?: Dispatch<SetStateAction<AuthState>>,
  login?: (
    usernameOrEmail: string,
    password:string,
    failureCallback?:()=>void
  )=>void;
  logout?: ()=>void;
}>({
  authState:{
    authStatus: AUTH_STATUS.INIT
  }
});

