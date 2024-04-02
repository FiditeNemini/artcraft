import { TopBarHelmet } from "~/modules/TopBarHelmet";
import { Form } from "@remix-run/react";
import { faKey, faUser } from "@fortawesome/pro-solid-svg-icons";
import {
  Button,
  H1,
  Input,
  Link,
  P,
} from '~/components';

export default function LoginScreen() {
  return (
    <div
      className="fixed w-full overflow-scroll"
      style={{height: "calc(100% - 72px)"}}
    >
      <TopBarHelmet children={null}/>
      <div className="w-10/12 max-w-2xl mx-auto my-6">
        <H1 className="text-center">Login to FakeYou</H1>
      </div>
      <div
        className='bg-ui-panel w-10/12 max-w-2xl mx-auto my-6 rounded-lg p-6 border border-ui-panel-border'
      >
        <Form method="post" >
          <Input
            label="Username or Email"
            icon={faUser}
            type="email"
            name="email"
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
        </Form>
      </div>
    </div>
  );
}
