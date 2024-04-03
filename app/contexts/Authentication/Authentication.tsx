import {
  createContext,
  useEffect,
  useCallback,
  useState, 
  ReactNode,
  Dispatch,
  SetStateAction
} from "react";
import { useCookies } from 'react-cookie';

import {
  SessionResponse,
  AuthState,
} from "./types";

import { CreateSession, DestroySession, GetSession } from "./utilities";

export const AuthenticationContext = createContext<{
  authState?: AuthState,
  setAuthState?: Dispatch<SetStateAction<AuthState | undefined>>,
  persistLoginOrOut?: ()=>void,
  loginAndGetUserInfo?: (
    usernameOrEmail: string,
    password:string,
    failureCallback?:()=>void
  )=>void;
  logout?: ()=>void;
}>({});

export const AuthenticationProvider = ({children}:{children:ReactNode})=>{
  const [authCookies, setAuthCookie, removeAuthCookie] = useCookies(['userInfo']);
  const [authState, setAuthState] = useState<AuthState | undefined>(undefined);

  const persistLoginOrOut = useCallback(()=>{
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
  }, []);

  const loginAndGetUserInfo = (usernameOrEmail: string, password:string, failureCallback?:()=>void)=>{
    CreateSession({usernameOrEmail, password})
      .then((respond)=>{
        GetSession().then((
          res: SessionResponse
        )=>{
          if(res.success && res.user && setAuthState){
            setAuthCookie('userInfo', res.user);
            setAuthState({
              isLoggedIn: true,
              userInfo: res.user
            });
          }else{
            if(failureCallback) failureCallback();
          }
        });
      });
  }

  const logout = ()=>{
    DestroySession().then((res)=>{
      if (res && setAuthState) {
        setAuthState({
          isLoggedIn: false,
          userInfo: undefined
        });
      }
    });
  }
  useEffect(()=>{
    if (authCookies !== undefined && authState===undefined){
      persistLoginOrOut();
    }
  },[]);

  return(
    <AuthenticationContext.Provider value={{
      authState,
      setAuthState,
      persistLoginOrOut,
      loginAndGetUserInfo,
      logout,
    }}>
      {children}
    </AuthenticationContext.Provider>
  )
}
  