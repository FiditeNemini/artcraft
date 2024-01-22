import React, { useState } from "react";
import { SessionContext } from "context";
import { Modal } from "components/common";
import AccountModal from "components/layout/AccountModal";
import { ModalView } from "context/SessionContext";

interface Props {
  children?: any;
  querySession: any;
  querySubscriptions: any;
  sessionFetched: boolean;
  sessionWrapper?: any;
}

export default function SessionProvider({ children, querySession, querySubscriptions, sessionFetched, sessionWrapper }: Props) {
  console.log("🥕",sessionWrapper);
  const sessionResponse = sessionWrapper?.sessionStateResponse || { logged_in: false };
  const { logged_in: loggedIn, user } = sessionResponse;
  const [view,viewSet] = useState(ModalView.Closed);
  const open = () => viewSet(ModalView.Signup);
  const close = () => { viewSet(ModalView.Closed);};
  const viewSwitch = () => view === ModalView.Signup ? viewSet(ModalView.Login) : viewSet(ModalView.Signup);
  const check = () => {
    if (user) {
      return true;
    } else {
      open();
      return false;
    }
  };
  const userTokenMatch = (otherUserToken: string) => !otherUserToken || !user?.user_token ? false :  user.user_token === otherUserToken;
  const canEditTtsModel = (userToken: string) => user?.canEditOtherUsersTtsModels || userTokenMatch(userToken);

  return <SessionContext.Provider {...{ value: {
    canEditTtsModel,
    check,
    loggedIn,
    modal: { close, open, view },
    querySession,
    querySubscriptions,
    sessionFetched,
    user,
    userTokenMatch
  } }}>
    { children }
    {
      <Modal {...{
        content: AccountModal,
        contentProps: { view, viewSwitch },
        handleClose: close,
        noHeader: true,
        show: view > 0,
        showButtons: false,
        // title: "You need to login",
      }}/>
    }
  </SessionContext.Provider>
};