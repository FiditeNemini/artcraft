import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useSignalEffect, useSignals } from "@preact/signals-react/runtime";

import { faKey, faUser } from "@fortawesome/pro-solid-svg-icons";

import { AUTH_STATUS } from "~/enums";
import { authentication, login } from "~/signals";

import { Button, H1, Input, Link, P } from "~/components";
import { LoadingDots } from "~/components";

export default function LoginScreen() {
  useSignals();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showLoader, setShowLoader] = useState<string | undefined>(undefined);
  const formRef = useRef<HTMLFormElement | null>(null);
  const { status: authStatus } = authentication;

  const handleOnSumbit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (formRef.current) {
      const form = new FormData(formRef.current);
      const usernameOrEmail = form.get("usernameOrEmail")?.toString();
      const password = form.get("password")?.toString();
      if (usernameOrEmail && password && login) {
        setShowLoader("Authenticating");
        login({
          usernameOrEmail,
          password,
          failureCallback: () => {
            setShowLoader(undefined);
          },
        });
      }
    }
  }; // end handleOnSubmit

  useSignalEffect(() => {
    const redirectPath = searchParams.get("redirect");
    if (authStatus.value === AUTH_STATUS.LOGGED_IN)
      navigate(redirectPath ? redirectPath : "/");
  });

  return (
    <div
      className="fixed w-full overflow-scroll"
      style={{ height: "calc(100% - 72px)" }}
    >
      <div className="mx-auto my-6 w-10/12 max-w-2xl">
        <H1 className="text-center">Login to Storyteller</H1>
      </div>
      <div className="relative mx-auto my-6 w-10/12 max-w-2xl overflow-hidden rounded-lg border border-ui-panel-border bg-ui-panel p-6">
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
            <Link to="/signup">Sign Up</Link>
          </div>
          <Button>Login</Button>
        </form>
        <LoadingDots
          className="absolute left-0 top-0 h-full w-full"
          isShowing={showLoader !== undefined}
          message={showLoader}
          type="bricks"
        />
      </div>
    </div>
  );
}
