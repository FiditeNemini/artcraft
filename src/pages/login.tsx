import { useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSignalEffect } from "@preact/signals-react/runtime";

import { faKey, faUser } from "@fortawesome/pro-solid-svg-icons";
import { Button, Input, LoadingSpinner } from "~/components/ui";
import { authentication } from "~/signals";

import { paperWrapperStyles } from "~/components/styles";
import { twMerge } from "tailwind-merge";

export const Login = () => {
  const {
    signals: { status: authStatus },
    fetchers: { login },
    enums: { AUTH_STATUS },
  } = authentication;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  const authLoaderMessage = getAuthLoaderMessage();
  const shouldShowLoader = checkShouldShowLoader();
  // const showNoAccessModal = authStatus.value === AUTH_STATUS.NO_ACCESS;
  function checkShouldShowLoader() {
    return (
      authStatus.value === AUTH_STATUS.LOGGING ||
      authStatus.value === AUTH_STATUS.LOGGED_IN
    );
  }
  function getAuthLoaderMessage() {
    if (authStatus.value === AUTH_STATUS.LOGGED_IN) {
      return "Authenticated, Redirecting...";
    }
    if (authStatus.value === AUTH_STATUS.GET_USER_INFO) {
      return "Getting User Info...";
    }
    return "Getting Session...";
  }
  // const handleClose = () => {
  //   if (authentication.status.value !== AUTH_STATUS.LOGGED_OUT) {
  //     logout();
  //   }
  // };

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
      <div
        className={twMerge(
          paperWrapperStyles,
          "relative mx-auto w-10/12 max-w-2xl p-6",
        )}
      >
        <form
          ref={formRef}
          onSubmit={handleOnSumbit}
          className={twMerge(
            "flex flex-col gap-4",
            shouldShowLoader && "opacity-0",
          )}
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

          <Button>Login</Button>
        </form>
        {shouldShowLoader && (
          <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
            <LoadingSpinner
              isShowing={shouldShowLoader}
              message={authLoaderMessage}
            />
          </div>
        )}

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
