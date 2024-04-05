import { useContext, useEffect, ComponentType } from "react";
import { useNavigate, useLocation } from "@remix-run/react";
import { AuthenticationContext } from "~/contexts/Authentication";

export const withProtectionRoute = <P extends {}>(Component: ComponentType<P>) => (rest:P) => {
  const { authState } = useContext(AuthenticationContext);
  // console.log(authState);
  if (authState.isLoggedIn === undefined ) {
    return <>waiting</>;
  }
  if (authState.isLoggedIn === false) {
    return <RedirectToLogin />
  }
  return (
    <Component  {...rest}/>
  );
}

const RedirectToLogin = ()=>{
  const navigate = useNavigate();
  const {pathname} = useLocation();
  useEffect(()=>{
    navigate(`/login?redirect=${pathname}`);
  },[]);
  return  <>redirecting</>
}