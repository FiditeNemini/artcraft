import { useEffect, ComponentType } from "react";
import { useNavigate, useLocation } from "@remix-run/react";
import { useSignals } from "@preact/signals-react/runtime";
import { LoadingDots } from "~/components";
import { authentication } from "~/signals";
import { AUTH_STATUS } from "~/enums";

export const withProtectionRoute =
  <P extends {}>(Component: ComponentType<P>) =>
  (rest: P) => {
    useSignals();
    const { status } = authentication;

    //render according to auth status
    if (status.value === AUTH_STATUS.LOGGED_OUT) {
      return <RedirectToLogin />;
    }
    if (status.value === AUTH_STATUS.LOGGED_IN) {
      return <Component {...rest} />;
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
