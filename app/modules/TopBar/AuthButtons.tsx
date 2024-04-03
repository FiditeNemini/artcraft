import { useContext, } from "react";

import { AuthenticationContext } from "~/contexts/Authentication";
import { Button, ButtonLink } from "~/components";

export const AuthButtons = ()=>{
  const {authState, logout} = useContext(AuthenticationContext);
  const handleLogout = ()=>{
    if(logout)logout();
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

