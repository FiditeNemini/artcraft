import { useCallback, useEffect, useState, ReactNode} from "react";
import { SessionResponse, AuthState, STORAGE_KEYS, AUTH_STATUS, UserInfo} from "./types";
import { CreateSession, DestroySession, GetSession } from "./utilities";
import { AuthenticationContext } from "./AuthenticationContext";

export const AuthenticationProvider = ({children}:{children:ReactNode})=>{
  console.log('auth provider rerender');

  const [authState, setAuthState] = useState<AuthState>({
    authStatus: AUTH_STATUS.INIT
  });

  const startLoggingState = useCallback(()=>{
    setAuthState({
      authStatus: AUTH_STATUS.LOGGING,
      sessionToken: undefined,
      userInfo: undefined
    });
  }, []);

  const updateLoggingState = useCallback((sessionToken: string)=>{
    setAuthState({
      authStatus: AUTH_STATUS.LOGGING,
      sessionToken: sessionToken,
      userInfo: undefined
    });
  }, []);

  const setLoginState = useCallback((userInfo: UserInfo)=>{
    setAuthState((curr)=>({
      ...curr,
      authStatus: AUTH_STATUS.LOGGED_IN,
      userInfo: userInfo,
    }));
  }, [])

  const setLogoutState = useCallback(()=>{
    setAuthState({
      authStatus: AUTH_STATUS.LOGGED_OUT,
      sessionToken: undefined,
      userInfo: undefined
    });
  },[]);

  const login = useCallback((
    usernameOrEmail: string,
    password:string,
    failureCallback?:()=>void
  )=>{
    console.log('CreateSession');
    startLoggingState();
    CreateSession({usernameOrEmail, password})
      .then((loginResponse)=>{
        updateLoggingState(loginResponse.signed_session);
        GetSession(loginResponse.signed_session).then((
          sessionResponse: SessionResponse
        )=>{
          if(sessionResponse.success && sessionResponse.user && sessionResponse.user !== null){
            setLoginState(sessionResponse.user);
          }else{
            if(failureCallback) failureCallback();
            setLogoutState();
          }
        });
      });
  },[]);

  const logout = useCallback(()=>{
    const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (sessionToken !== null){
    DestroySession(sessionToken).then((res)=>{
      //TODO: error handling maybe necessary
    });}
    setLogoutState(); 
  },[]);

  //Set Session upon Auth State Changes
  useEffect(()=>{
    //On First Load
    if(authState.authStatus === AUTH_STATUS.INIT){
      //Persist Login if Session Data exist
      const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
      console.log(`Session Data: ${sessionToken?.substring(0, 30)}${sessionToken ? '...':''}`);
      if (sessionToken !== null){
        console.log('Getting session to persist login');
        updateLoggingState(sessionToken);
        GetSession(sessionToken).then((
          sessionResponse: SessionResponse
        )=>{
          console.log('Session Returned');
          console.log(sessionResponse);
          if(sessionResponse.success && sessionResponse.user && sessionResponse.user !== null){
            console.log('Setting Auth State');
            setLoginState(sessionResponse.user)
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
    if(authState.sessionToken !== null && authState.sessionToken !== undefined){
      localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, authState.sessionToken);
    }
    // Propagate Logout
    else if (authState.sessionToken === null){
      localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    }
  },[authState]);

  return(
    <AuthenticationContext.Provider value={{
      authState,
      setAuthState,
      login,
      logout,
    }}>
      {children}
    </AuthenticationContext.Provider>
  )
}
  