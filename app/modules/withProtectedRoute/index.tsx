import { useContext, useEffect, ComponentType } from "react";
import { useNavigate, useLocation } from "@remix-run/react";
import { AUTH_STATUS, AuthenticationContext } from "~/contexts/Authentication";
import { LoadingDots } from "~/components";

export const withProtectionRoute = <P extends {}>(Component: ComponentType<P>) => (rest:P) => {
  const { authState } = useContext(AuthenticationContext);
  if (authState.authStatus === AUTH_STATUS.LOGGED_OUT) {
    return <RedirectToLogin />
  }
  else if (authState.authStatus === AUTH_STATUS.LOGGED_IN ) {
    return (<Component {...rest}/>);
  }else {
    return(
      <div className="fixed w-full h-full flex flex-col  justify-center items-center">
        <LoadingDots type="bricks" message="Checking for Authentication..."/>
      </div>
    );
  }
}

const RedirectToLogin = ()=>{
  const navigate = useNavigate();
  const {pathname} = useLocation();
  useEffect(()=>{
    setTimeout(()=>navigate(`/login?redirect=${pathname}`), 2000);
  },[]);
  return  (
    <div className="fixed w-full h-full flex flex-col  justify-center items-center">
      <LoadingDots type="bricks" message="Failed, redirecting..."/>
    </div>
  );
}