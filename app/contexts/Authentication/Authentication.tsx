import {
  createContext,
  useCallback,
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
  STORAGE_KEYS
} from "./types";

import { CreateSession, DestroySession, GetSession } from "./utilities";

export const AuthenticationContext = createContext<{
  authState: AuthState,
  setAuthState?: Dispatch<SetStateAction<AuthState>>,
  loginAndGetUserInfo?: (
    usernameOrEmail: string,
    password:string,
    failureCallback?:()=>void
  )=>void;
  logout?: ()=>void;
}>({
  authState:{}
});

export const AuthenticationProvider = ({children}:{children:ReactNode})=>{
  // console.log('auth provider rerender');
  const [, setAuthCookie, removeAuthCookie] = useCookies([STORAGE_KEYS.USER_INFO]);
  const [authState, setAuthState] = useState<AuthState>({});

  const loginAndGetUserInfo = useCallback((
    usernameOrEmail: string,
    password:string,
    failureCallback?:()=>void
  )=>{
    CreateSession({usernameOrEmail, password})
      .then((respond)=>{
        GetSession().then((
          res: SessionResponse
        )=>{
          if(res.success && res.user && setAuthState){
            setAuthState({
              isLoggedIn: true,
              sessionData: JSON.stringify(res.user),
              userInfo: res.user
            });
          }else{
            if(failureCallback) failureCallback();
          }
        });
      });
  },[]);

  const setLogoutState = useCallback(()=>{
    setAuthState({
      isLoggedIn: false,
      sessionData: null,
      userInfo: undefined
    });
  },[]);

  const logout = useCallback(()=>{
    DestroySession().then((res)=>{
      if (res) setLogoutState(); 
    });
  },[]);

  //Set Session upon Auth State Changes
  useEffect(()=>{
    //On First Load
    if(authState.isLoggedIn === undefined){
      //Persist Login if Session Data exist
      const sessionData = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      // console.log(`Session Data: ${sessionData?.substring(0, 30)}${sessionData ? '...':''}`);
      if (sessionData !== null){
        // console.log('Getting session to persist login');
        GetSession().then((
          res: SessionResponse
        )=>{
          console.log('Session Returned');
          console.log(res);
          if(res.success && res.user){
            console.log('Setting Auth State');
            setAuthState({
              isLoggedIn: true,
              sessionData: JSON.stringify(res.user),
              userInfo: res.user
            });
          }else{
            console.log('Session expired, setting State');
            setLogoutState(); 
          }
        });
      }else{
        setLogoutState(); 
      }
    }

    // Propagate session data to localstorage
    if(authState.sessionData !== null && authState.sessionData !== undefined){
      localStorage.setItem(STORAGE_KEYS.USER_INFO, authState.sessionData);
      setAuthCookie(STORAGE_KEYS.USER_INFO, authState.userInfo);
    }
    // Propagate Logout
    else if (authState.sessionData === null){
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      removeAuthCookie(STORAGE_KEYS.USER_INFO);
    }
  },[authState]);

  return(
    <AuthenticationContext.Provider value={{
      authState,
      setAuthState,
      loginAndGetUserInfo,
      logout,
    }}>
      {children}
    </AuthenticationContext.Provider>
  )
}
  