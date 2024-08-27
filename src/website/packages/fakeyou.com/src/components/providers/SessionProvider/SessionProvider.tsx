import React, { createContext } from "react";
import ModalLayer from "components/providers/ModalProvider/ModalLayer";
import { ModalConfig, useModalState } from "hooks";
import AccountModal from "components/layout/AccountModal";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { StudioRolloutHostnameAllowed } from "@storyteller/components/src/utils/StudioRolloutHostnameAllowed";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { StyleVideoNotAvailable } from "v2/view/_common/StyleVideoNotAvailable";

export interface AccountModalMessages {
  loginMessage?: string;
  signupMessage?: string;
}

export interface AccountModalEvents {
  onModalClose?: () => void;
  onModalOpen?: () => void;
}

interface SessionContextType {
  canAccessStudio: () => boolean;
  canEditTtsModel: (creatorUserToken: string) => boolean;
  canEditMediaFile: (creatorUserToken?: string) => boolean;
  canBanUsers: () => boolean;
  loggedInOrModal: (acctMsgs: AccountModalMessages, cfg?: AccountModalEvents) => boolean;
  loggedIn: boolean;
  modal: {
    close: () => void;
    open: (cfg: ModalConfig) => void;
  };
  querySession?: any;
  querySubscriptions?: any;
  sessionFetched: boolean;
  sessionSubscriptions?: SessionSubscriptionsWrapper;
  sessionWrapper: SessionWrapper;
  studioAccessCheck: (x: any) => any;
  styleVideoAccessCheck: (x: any) => any;
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

// const thingy = new SessionWrapper()

export const SessionContext = createContext<SessionContextType>({
  canAccessStudio: () => false,
  canEditTtsModel: () => false,
  canEditMediaFile: () => false,
  canBanUsers: () => false,
  loggedInOrModal: () => false,
  loggedIn: false,
  sessionFetched: false,
  studioAccessCheck: () => null,
  styleVideoAccessCheck: () => null,
  modal: {
    close: () => { },
    open: () => { },
  },
  userTokenMatch: () => false,
  sessionWrapper: SessionWrapper.emptySession(),
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

  const { close, killModal, modalOpen, modalState, onModalCloseEnd, open } =
    useModalState({});

  const loggedInOrModal = (accountModalMessages: AccountModalMessages, events?: AccountModalEvents) => {
    if (user) {
      return true;
    } else {
      open({
        component: AccountModal,
        scroll: true,
        width: "small",
        props: { ...accountModalMessages },
        ...events
      });
      return false;
    }
  };
  // NB: Since user token matching is used for ownership permission checking, neither may be undefined!
  const userTokenMatch = (otherUserToken?: string) =>
    user?.user_token !== undefined &&
    otherUserToken !== undefined &&
    user.user_token === otherUserToken;
  const canEditTtsModel = (userToken: string) =>
    user?.can_delete_other_users_tts_models || userTokenMatch(userToken);
  const canEditMediaFile = (userToken?: string) =>
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

  const styleVideoAccessCheck = (content: React.ElementType) =>
    canAccessStudio() ? content : <StyleVideoNotAvailable />;

  const modal = { close, open };

  return (
    <SessionContext.Provider
      {...{
        value: {
          canAccessStudio,
          canEditTtsModel,
          canEditMediaFile,
          canBanUsers,
          loggedInOrModal,
          loggedIn,
          modal,
          querySession,
          querySubscriptions,
          sessionFetched,
          sessionSubscriptions,
          sessionWrapper,
          studioAccessCheck,
          styleVideoAccessCheck,
          user,
          userTokenMatch,
        },
      }}
    >
      {children}
      <ModalLayer
        {...{
          content: modalState?.component,
          contentProps: modalState?.props,
          close,
          // debug: "SessionProvider",
          killModal,
          lockTint: modalState?.lockTint,
          modalOpen,
          onModalCloseEnd,
          scroll: modalState?.scroll,
          width: modalState?.width,
        }}
      />
    </SessionContext.Provider>
  );
}
