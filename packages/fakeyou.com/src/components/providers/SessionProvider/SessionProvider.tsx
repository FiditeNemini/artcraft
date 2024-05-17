import React, { createContext, useState } from "react";
// import { SessionContext } from "context";
import { Modal } from "components/common";
import AccountModal from "components/layout/AccountModal";
// import { ModalView } from "context/SessionContext";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { StudioRolloutHostnameAllowed } from "@storyteller/components/src/utils/StudioRolloutHostnameAllowed";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";

export enum ModalView { // ignore this modal stuff for now -V
  Closed,
  Signup,
  Login,
}

interface ModalProps {
  // this too
  close: () => void;
  open: () => void;
  view: ModalView;
}

interface SessionContextType {
  canAccessStudio: () => boolean;
  canEditTtsModel: (token: string) => boolean;
  canEditMediaFile: (token: string) => boolean;
  canBanUsers: () => boolean;
  check: () => boolean;
  loggedIn: boolean;
  modal: ModalProps;
  querySession?: any;
  querySubscriptions?: any;
  sessionFetched: boolean;
  sessionSubscriptions?: any;
  studioAccessCheck: (x: any) => any;
  user?: any;
  userTokenMatch: (token: string) => boolean;
}

interface Props {
  children?: any;
  querySession: () => void;
  querySubscriptions: () => void;
  sessionFetched: boolean;
  sessionSubscriptions: SessionSubscriptionsWrapper;
  sessionWrapper: SessionWrapper;
}

// Functions are initially No-ops/dummies so that they are never undefined and never have to be called conditionally.
// These functions will never actually fire because they are immediately redefined in the provider below,
// as they must be as they utilize the provider's state.

export const SessionContext = createContext<SessionContextType>({
  canAccessStudio: () => false,
  canEditTtsModel: () => false,
  canEditMediaFile: () => false,
  canBanUsers: () => false,
  check: () => false,
  loggedIn: false,
  sessionFetched: false,
  studioAccessCheck: () => null,
  modal: {
    close: () => {},
    open: () => {},
    view: ModalView.Closed,
  },
  userTokenMatch: () => false,
});

export default function SessionProvider({
  children,
  querySession,
  querySubscriptions,
  sessionFetched,
  sessionSubscriptions,
  sessionWrapper,
}: Props) {
  const sessionResponse = sessionWrapper?.sessionStateResponse || {
    logged_in: false,
    user: null,
  };
  const { logged_in: loggedIn, user } = sessionResponse;
  const [view, viewSet] = useState(ModalView.Closed);
  const open = () => viewSet(ModalView.Signup);
  const close = () => {
    viewSet(ModalView.Closed);
  };
  const viewSwitch = () =>
    viewSet(view === ModalView.Signup ? ModalView.Login : ModalView.Signup);
  const check = () => {
    if (user) {
      return true;
    } else {
      open();
      return false;
    }
  };
  const userTokenMatch = (otherUserToken: string) =>
    !otherUserToken || !user?.user_token
      ? false
      : user.user_token === otherUserToken;
  const canEditTtsModel = (userToken: string) =>
    user?.can_delete_other_users_tts_models || userTokenMatch(userToken);
  const canEditMediaFile = (userToken: string) =>
    user?.can_delete_other_users_tts_results || userTokenMatch(userToken);
  const canBanUsers = () => user?.can_ban_users || false;
  const canAccessStudio = () => {
    const hostnameAllowed = StudioRolloutHostnameAllowed();
    const userAllowed =
      !!user?.can_access_studio ||
      !!user?.maybe_feature_flags.includes("studio");
    return hostnameAllowed && userAllowed;
  };

  const studioAccessCheck = (content: React.ElementType) =>
    canAccessStudio() ? content : <StudioNotAvailable />;

  const modal = { close, open, view };

  return (
    <SessionContext.Provider
      {...{
        value: {
          canAccessStudio,
          canEditTtsModel,
          canEditMediaFile,
          canBanUsers,
          check,
          loggedIn,
          modal,
          querySession,
          querySubscriptions,
          sessionFetched,
          sessionSubscriptions,
          studioAccessCheck,
          user,
          userTokenMatch,
        },
      }}
    >
      {children}
      {
        <Modal
          {...{
            content: AccountModal,
            contentProps: { view, viewSwitch },
            handleClose: close,
            noHeader: true,
            show: view > 0,
            showButtons: false,
            // title: "You need to login",
          }}
        />
      }
    </SessionContext.Provider>
  );
}
