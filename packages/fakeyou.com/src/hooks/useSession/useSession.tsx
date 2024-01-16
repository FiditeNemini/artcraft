import { useContext } from 'react';
import { SessionContext } from 'context';

export default function useInferenceJobs() {
  const { querySession, querySubscriptions, sessionFetched, sessionWrapper } = useContext(SessionContext);
  const { logged_in: loggedIn, user } = sessionWrapper?.sessionStateResponse || { logged_in: false };

  return {
    loggedIn,
    querySession,
    querySubscriptions,
    sessionFetched,
    user
  };
};