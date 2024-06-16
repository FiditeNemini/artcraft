import React from "react";
import {
  InferenceJobsProvider,
  ModalProvider,
  NotificationProvider,
  SessionProvider,
} from "components/providers";
import ServerStatusChecker from "./ServerStatusChecker";
import { useInferenceJobsPolling } from "hooks";

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
  const { byCategory, enqueueInferenceJob, inferenceJobs } =
    useInferenceJobsPolling({ sessionWrapper: state.sessionWrapper });

  const sessionProps = {
    querySession: querySession,
    querySubscriptions,
    sessionSubscriptions: state.sessionSubscriptionsWrapper,
    sessionWrapper: state.sessionWrapper,
    sessionFetched: state.sessionFetched,
  };
  const inferenceJobsProps = {
    enqueue: enqueueInferenceJob,
    byCategory,
    inferenceJobs,
  };

  return (
    <SessionProvider {...sessionProps}>
      <InferenceJobsProvider {...inferenceJobsProps}>
        <NotificationProvider>
          <ServerStatusChecker />
          <ModalProvider>{children}</ModalProvider>
        </NotificationProvider>
      </InferenceJobsProvider>
    </SessionProvider>
  );
}
