import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { faKey, faUser } from "@fortawesome/pro-solid-svg-icons";
import { AUTH_STATUS, AuthenticationContext } from "~/contexts/Authentication";

import { Button,H1,Input,Link,P } from '~/components';
import { LoadingDots } from "~/components";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showLoader, setShowLoader] = useState<string|undefined>(undefined);
  const formRef = useRef<HTMLFormElement | null>(null);
  const {authState, login} = useContext(AuthenticationContext);

  const handleOnSumbit = (ev: React.FormEvent<HTMLFormElement>)=>{
    ev.preventDefault();
    if(formRef.current){
      const form = new FormData(formRef.current);
      const usernameOrEmail =  form.get("usernameOrEmail")?.toString();
      const password = form.get("password")?.toString();
      if( usernameOrEmail && password && login){
        setShowLoader("Authenticating");
        login(
          usernameOrEmail,
          password,
          ()=>{
            setShowLoader(undefined);
        });
      }
    }
  }// end handleOnSubmit

  useEffect(()=>{
    const redirectPath = searchParams.get('redirect');
    if(authState && authState.authStatus === AUTH_STATUS.LOGGED_IN)
      navigate(redirectPath ? redirectPath:'/');
  },[authState]);

  return (
    <div
      className="fixed w-full overflow-scroll"
      style={{height: "calc(100% - 72px)"}}
    >
      <div className="w-10/12 max-w-2xl mx-auto my-6">
        <H1 className="text-center">Login to Storyteller</H1>
      </div>
      <div
        className='relative bg-ui-panel w-10/12 max-w-2xl mx-auto my-6 rounded-lg p-6 border border-ui-panel-border overflow-hidden'
      >
        <form ref={formRef} onSubmit={handleOnSumbit}>
          <Input
            label="Username or Email"
            icon={faUser}
            name="usernameOrEmail"
            placeholder="Username or Email"
            autoComplete="username"
            required
          />
          <br />
          <Input
            label="Password"
            icon={faKey}
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />
          <br />
          <div className="flex justify-end gap-2">
            <P>Don't have an account?</P>
            <Link to='/signup'>Sign Up</Link>
          </div>
          <Button>Login</Button>
        </form>
        <LoadingDots
          className="absolute top-0 left-0 w-full h-full"
          isShowing={showLoader !== undefined}
          message={showLoader}
          type="bricks"
        />
      </div>
    </div>
  );
}