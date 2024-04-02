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
  SessionInfoResponse,
  UserInfo,
} from "./types";

import { GetSession } from "./utilities";

export const AuthenticationContext = createContext<[
  UserInfo | undefined,
  Dispatch<SetStateAction<UserInfo | undefined>> | undefined
]>([
  undefined, undefined
]);

export const AuthenticationProvider = ({children}:{children:ReactNode})=>{
  const [authCookies, setAuthCookie, removeAuthCookie] = useCookies(['userInfo']);
  const [userInfo, setUserInfo] = useState<UserInfo|undefined>(undefined);

  useEffect(()=>{
    if(authCookies.userInfo === undefined || authCookies.userInfo === null){
      GetSession().then((
        res: SessionInfoResponse
      )=>{
        if(res.success && res.user){ 
          setAuthCookie('userInfo', res.user);
          setUserInfo(res.user);
        }
      });
    }
  },[]);

  return(
    <AuthenticationContext.Provider value={[userInfo, setUserInfo]}>
      {children}
    </AuthenticationContext.Provider>
  )
}
  