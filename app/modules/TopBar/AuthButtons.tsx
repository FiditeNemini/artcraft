import { useContext, } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { AuthenticationContext } from "~/contexts/Authentication";
import { Button, ButtonLink } from "~/components";
import { DialogueInference } from "../DialogueInference";
import { inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";

export const AuthButtons = ()=>{
  useSignals();

  const {authState, logout} = useContext(AuthenticationContext);
  const handleLogout = ()=>{
    if(logout)logout();
  }
  if ( authState && authState.isLoggedIn ) {
    return(
      <>
        <DialogueInference />
        <Button onClick={handleLogout}>Log Out</Button>
      </>
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

