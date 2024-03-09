import React from 'react';
import { InferenceJobsProvider, ModalProvider, NotificationProvider, SessionProvider } from "components/providers";

interface Props {
  children?: any,
  enqueue: any
  querySession: any,
  querySubscriptions: any,
  state: any,
}

export default function CoreServicesProvider({ children, enqueue, querySession, querySubscriptions, state }: Props) {
  const sessionProps = {
    querySession: querySession,
    querySubscriptions,
    sessionSubscriptions: state.sessionSubscriptionsWrapper,
    sessionWrapper: state.sessionWrapper,
    sessionFetched: state.sessionFetched,
 };
 const inferenceJobsProps = {
    enqueue,
    byCategory: state.inferenceJobsByCategory,
    inferenceJobs: state.inferenceJobs,
  };

  return <SessionProvider {...sessionProps} >
    <InferenceJobsProvider {...inferenceJobsProps}>
      <NotificationProvider>
        <ModalProvider>
          { children }
        </ModalProvider>
      </NotificationProvider>
    </InferenceJobsProvider>
  </SessionProvider>;
};