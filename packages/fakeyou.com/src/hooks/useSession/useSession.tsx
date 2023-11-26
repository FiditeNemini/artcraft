import { useContext } from 'react';
import { SessionContext } from 'context';

export default function useInferenceJobs() {
  const { sessionFetched, sessionWrapper } = useContext(SessionContext);
  return {
    sessionFetched,
    ...sessionWrapper?.sessionStateResponse 
  };
};