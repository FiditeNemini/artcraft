import { useContext, } from "react";

import { AuthenticationContext } from "~/contexts/Authentication";
import { DestorySession } from "~/contexts/Authentication/utilities";
import { Button, ButtonLink } from "~/components";

export const AuthButtons = ()=>{
  const [authState, setAuthState] = useContext(AuthenticationContext);
  const handleLogout = ()=>{
    DestorySession().then((res)=>{
      if (res && setAuthState) {
        setAuthState({
          isLoggedIn: false,
          userInfo: undefined
        });
      }
    });
  }
  if ( authState && authState.isLoggedIn ) {
    return(
      <Button onClick={handleLogout}>Log Out</Button>
    );
  }else{
    return(
      <>
        <ButtonLink variant="secondary" to='/login'>Login</ButtonLink>
        <ButtonLink to='/signup'>Sign Up</ButtonLink>
      </>
    );
  }
}

