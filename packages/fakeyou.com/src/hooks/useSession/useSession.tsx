import { useContext } from 'react';
import { SessionContext } from 'context';

export default function useInferenceJobs() {
  return useContext(SessionContext);
};