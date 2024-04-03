import {
  createContext,
  useEffect, 
  useState, 
  ReactNode,
  Dispatch,
  SetStateAction
} from "react";
import { useCookies } from 'react-cookie';

import {
  SessionResponse,
  AuthState,
  UserInfo
} from "./types";

import { GetSession } from "./utilities";

export const AuthenticationContext = createContext<[
  AuthState | undefined,
  Dispatch<SetStateAction<AuthState | undefined>> | undefined
]>([
  undefined, undefined
]);

export const AuthenticationProvider = ({children}:{children:ReactNode})=>{
  const [authCookies, setAuthCookie, removeAuthCookie] = useCookies(['userInfo']);
  const [authState, setAuthState] = useState<AuthState | undefined>(undefined);

  useEffect(()=>{
    console.log(authCookies);
    console.log(authState);
    if (authCookies !== undefined && authState===undefined){
      GetSession().then((
        res: SessionResponse
      )=>{
        if(res.success && res.user){ 
          setAuthCookie('userInfo', res.user);
          setAuthState({
            isLoggedIn: true,
            userInfo: res.user
          });
        }else{
          removeAuthCookie('userInfo');
        }
      });
    }
  },[]);

  return(
    <AuthenticationContext.Provider value={[authState, setAuthState]}>
      {children}
    </AuthenticationContext.Provider>
  )
}
  