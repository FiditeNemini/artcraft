import { useContext, useRef } from "react";
import { useCookies } from 'react-cookie';
import { faKey, faUser } from "@fortawesome/pro-solid-svg-icons";
import { CreateSession, GetSession } from '~/contexts/Authentication/utilities'
import {
  SessionInfoResponse,
} from "~/contexts/Authentication/types";
import {
  Button,
  H1,
  Input,
  Link,
  P,
} from '~/components';
import { AuthenticationContext } from "~/contexts/Authentication";

export default function LoginScreen() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [authCookies, setAuthCookie, removeAuthCookie] = useCookies(['userInfo']);
  const [userInfo, setUserInfo] = useContext(AuthenticationContext);


  const handleOnSumbit = (ev: React.FormEvent<HTMLFormElement>)=>{
    ev.preventDefault();
    if(formRef.current){
      const form = new FormData(formRef.current);
      const usernameOrEmail =  form.get("usernameOrEmail")?.toString();
      const password = form.get("password")?.toString();
      if( usernameOrEmail && password){
        CreateSession({usernameOrEmail, password})
        .then((respond)=>{
          GetSession().then((
            res: SessionInfoResponse
          )=>{
            if(res.success && res.user && setUserInfo){
              console.log(res);
              setAuthCookie('userInfo', res.user);
              setUserInfo(res.user);
            }
          });
        });
      }
    }
  }
  return (
    <div
      className="fixed w-full overflow-scroll"
      style={{height: "calc(100% - 72px)"}}
    >
      <div className="w-10/12 max-w-2xl mx-auto my-6">
        <H1 className="text-center">Login to FakeYou</H1>
      </div>
      <div
        className='bg-ui-panel w-10/12 max-w-2xl mx-auto my-6 rounded-lg p-6 border border-ui-panel-border'
      >
        <form ref={formRef} onSubmit={handleOnSumbit}>
          <Input
            label="Username or Email"
            icon={faUser}
            name="usernameOrEmail"
            placeholder="Username or Email"
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
      </div>
    </div>
  );
}


// export const action = async ({ request }: ActionFunctionArgs) => {
//   await auth.authenticate("form", request, {
//     successRedirect: "/idealenigma",
//     failureRedirect: "/login",
//   });
// };

// type LoaderError = { message: string } | null;
// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   await auth.isAuthenticated(request, { successRedirect: "/idealenigma" });
//   const session = await sessionStorage.getSession(
//     request.headers.get("Cookie"),
//   );
//   const error = session.get(auth.sessionErrorKey) as LoaderError;
//   return json({ error });
// };
