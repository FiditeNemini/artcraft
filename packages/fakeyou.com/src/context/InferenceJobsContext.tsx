import { createContext } from 'react';

interface InferenceJobsContext { byCategory?: any }

export default createContext<InferenceJobsContext>({ });