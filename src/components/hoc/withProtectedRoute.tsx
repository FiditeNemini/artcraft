import { ComponentType, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSignalEffect } from "@preact/signals-react/runtime";
import { Spinner } from "~/components/ui";
import { authentication } from "~/signals";

export const withProtectionRoute = <P extends object>(
  Component: ComponentType<P>,
) =>
  function ProtectionRoute(rest: P) {
    const {
      signals: { status, userInfo },
      fetchers: { persistLogin },
      enums: { AUTH_STATUS },
    } = authentication;

    useSignalEffect(() => {
      persistLogin();
    });

    //render according to auth status
    if (
      status.value === AUTH_STATUS.INIT ||
      status.value === AUTH_STATUS.LOGGING ||
      status.value === AUTH_STATUS.GET_USER_INFO
    ) {
      return (
        <div className="fixed flex h-full w-full flex-col items-center justify-center">
          <Spinner />
        </div>
      );
    }

    if (
      status.value === AUTH_STATUS.LOGGED_IN &&
      userInfo.value &&
      userInfo.value.can_access_studio
    ) {
      return <Component {...rest} />;
    }

    return <RedirectToLogin />;
  };

const RedirectToLogin = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const timeoutTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!timeoutTimer.current) {
      timeoutTimer.current = setTimeout(
        () => navigate(`/login?redirect=${pathname}`),
        2000,
      );
    }
  }, [navigate, pathname]);
  return (
    <div className="fixed flex h-full w-full flex-col items-center justify-center">
      <Spinner />
    </div>
  );
};
