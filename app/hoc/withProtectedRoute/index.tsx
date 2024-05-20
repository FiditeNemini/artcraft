import { useEffect, ComponentType, useState } from "react";
import { useNavigate, useLocation } from "@remix-run/react";
import { useSignals } from "@preact/signals-react/runtime";
import { ConfirmationModal, LoadingDots } from "~/components";
import { authentication } from "~/signals";
import { AUTH_STATUS } from "~/enums";

export const withProtectionRoute =
  <P extends {}>(Component: ComponentType<P>) =>
  (rest: P) => {
    useSignals();
    const { status, userInfo } = authentication;
    const [auth, setAuth] = useState("init");

    useEffect(() => {
      if (auth === "redirect") {
        window.open("https://storyteller.ai/beta-key/redeem", "_self");
      }
    }, [auth]);

    //render according to auth status
    if (status.value === AUTH_STATUS.LOGGED_OUT) {
      return <RedirectToLogin />;
    }
    if (auth === "init") {
      if (status.value === AUTH_STATUS.LOGGED_IN) {
        if (userInfo.value?.can_access_studio) {
          return <Component {...rest} />;
        }
        setAuth("confirm");
      }
    }

    if (auth === "confirm") {
      return (
        <ConfirmationModal
          text="We're in a closed beta and you'll need a beta key to use this app."
          title="Unauthorized"
          open={true}
          onClose={() => setAuth("redirect")}
          okText="Okay"
          onOk={() => setAuth("redirect")}
        />
      );
    }
    return (
      <div className="fixed flex h-full w-full flex-col  items-center justify-center">
        <LoadingDots type="bricks" message="Checking for Authentication..." />
      </div>
    );
  };

const RedirectToLogin = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    setTimeout(() => navigate(`/login?redirect=${pathname}`), 2000);
  }, []);
  return (
    <div className="fixed flex h-full w-full flex-col  items-center justify-center">
      <LoadingDots type="bricks" message="Redirecting..." />
    </div>
  );
};
