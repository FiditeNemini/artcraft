import { Form } from "@remix-run/react";
import { faEnvelope, faKey, faUser } from "@fortawesome/pro-solid-svg-icons";
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
      <div className="w-10/12 max-w-2xl mx-auto my-6">
        <H1 className="text-center">Sign Up to Storyteller</H1>
      </div>
      <div
        className='bg-ui-panel w-10/12 max-w-2xl mx-auto my-6 rounded-lg p-6 border border-ui-panel-border'
      >
        <Form method="post" >
          <Input
            label="Username"
            icon={faUser}
            placeholder="Username"
            name="username"
            required
          />
          <br />
          <Input
            type="email"
            label="Email"
            icon={faEnvelope}
            placeholder="Email"
            name="email"
            required
          />
          <br />
          <Input
            type="password"
            label="Password"
            icon={faKey}
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />
          <br />
          <Input
            type="password"
            label="Password Confrimation"
            icon={faKey}
            placeholder="Password COnfirmation"
            name="password-confirmation"
            required
          />
          <br />
          <br />
          <Button>Sign up</Button>
          <br />
          <div className="flex gap-2">
            <P>Already have an account?</P>
            <Link to='/login'>Log in instead</Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
