import { useContext } from 'react';
import { SessionContext } from 'context';

export default function useInferenceJobs() {
  const { sessionWrapper } = useContext(SessionContext);
  return sessionWrapper?.sessionStateResponse || {};
};