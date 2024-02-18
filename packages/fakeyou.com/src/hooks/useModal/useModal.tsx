import { useContext } from 'react';
import { ModalContext } from 'context';

export default function useInferenceJobs() {
  return useContext(ModalContext);
};