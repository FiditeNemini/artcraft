import { useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSignalEffect } from "@preact/signals-react/runtime";

import { faKey, faUser } from "@fortawesome/pro-thin-svg-icons";

import { AUTH_STATUS } from "~/enums/Authentication";
import {
  authentication,
  login,
  // logout
} from "~/signals";

import { Input, Loader } from "~/components/ui";

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const formRef = useRef<HTMLFormElement | null>(null);
  const { status: authStatus } = authentication;
  const authLoaderMessage = getAuthLoaderMessage();
  const shouldShowLoader = checkShouldShowLoader();

  // const showNoAccessModal = authStatus.value === AUTH_STATUS.NO_ACCESS;

  const handleOnSumbit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (formRef.current) {
      const form = new FormData(formRef.current);
      const usernameOrEmail = form.get("usernameOrEmail")?.toString();
      const password = form.get("password")?.toString();
      if (usernameOrEmail && password && login) {
        login({
          usernameOrEmail,
          password,
        });
      }
    }
  }; // end handleOnSubmit

  useSignalEffect(() => {
    const redirectPath = searchParams.get("redirect");
    if (authStatus.value === AUTH_STATUS.LOGGED_IN) {
      navigate(redirectPath ? redirectPath : "/");
    }
  });

  return (
    <div className="fixed flex h-full w-full flex-col items-center justify-center">
      <div className="mx-auto my-6 flex w-10/12 max-w-2xl gap-4">
        <img src="/brand/Storyteller-Logo.png" alt="Storyteller Logo" />
      </div>
      <div className="border-ui-border bg-ui-panel relative mx-auto w-10/12 max-w-2xl overflow-hidden rounded-lg border p-6">
        <form
          ref={formRef}
          onSubmit={handleOnSumbit}
          className="flex flex-col gap-4"
        >
          <Input
            label="Username or Email"
            icon={faUser}
            name="usernameOrEmail"
            placeholder="Username or Email"
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            icon={faKey}
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            required
          />
          <div className="align-items mb-3 flex">
            <a
              href="https://storyteller.ai/password-reset"
              className="text-brand-primary hover:text-brand-primary-400 grow text-sm transition-all duration-150"
            >
              Forgot your password?
            </a>
            <div className="flex justify-end gap-1 text-sm">
              <p>Don&apos;t have an account?</p>
              <Link to="/signup">Sign Up</Link>
            </div>
          </div>

          <button className="h-11 w-full text-sm">Login</button>
        </form>

        <Loader isShowing={shouldShowLoader} message={authLoaderMessage} />

        {/*
        <ConfirmationModal
          text="We're in a closed beta and you'll need a beta key to use this app."
          title="Unauthorized"
          open={showNoAccessModal}
          onClose={handleClose}
          cancelText="Close"
          onCancel={handleClose}
          okText="Get Beta Key"
          onOk={() => {
            handleClose();
            if (window) {
              window.open("https://storyteller.ai/beta-key/redeem", "_blank");
            }
          }} 
        />*/}
      </div>
    </div>
  );
};

// const handleClose = () => {
//   if (authentication.status.value !== AUTH_STATUS.LOGGED_OUT) {
//     logout();
//   }
// };

const checkShouldShowLoader = () => {
  return (
    authentication.status.value === AUTH_STATUS.LOGGING ||
    authentication.status.value === AUTH_STATUS.LOGGED_IN
  );
};
const getAuthLoaderMessage = () => {
  if (authentication.status.value === AUTH_STATUS.LOGGED_IN) {
    return "Authenticated, Redirecting...";
  }
  if (authentication.status.value === AUTH_STATUS.GET_USER_INFO) {
    return "Getting User Info...";
  }
  return "Getting Session...";
};
