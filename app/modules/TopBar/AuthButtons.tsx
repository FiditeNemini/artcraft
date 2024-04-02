import { useContext, } from "react";

import { AuthenticationContext } from "~/contexts/Authentication";
import { Button, ButtonLink } from "~/components";

export const AuthButtons = ()=>{
  const [userInfo, setUserInfo] = useContext(AuthenticationContext);
  console.log("auth buttons rerender")
  console.log(userInfo);
  if ( userInfo ) {
    return(
      <Button>Log Out</Button>
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

