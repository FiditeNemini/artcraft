import React from "react";
import {
  InferenceJobsProvider,
  ModalProvider,
  NotificationProvider,
  SessionProvider,
  SignUpQuestionnaireProvider,
} from "components/providers";
import ServerStatusChecker from "./ServerStatusChecker";

interface Props {
  children?: any;
  querySession: any;
  querySubscriptions: any;
  state: any;
}

export default function CoreServicesProvider({
  children,
  querySession,
  querySubscriptions,
  state,
}: Props) {
  const sessionProps = {
    querySession: querySession,
    querySubscriptions,
    sessionSubscriptions: state.sessionSubscriptionsWrapper,
    sessionWrapper: state.sessionWrapper,
    sessionFetched: state.sessionFetched,
  };

  return (
    <SessionProvider {...sessionProps}>
      <InferenceJobsProvider>
        <NotificationProvider>
          <ServerStatusChecker />
          <ModalProvider>
            <SignUpQuestionnaireProvider>
              {children}
            </SignUpQuestionnaireProvider>
          </ModalProvider>
        </NotificationProvider>
      </InferenceJobsProvider>
    </SessionProvider>
  );
}
