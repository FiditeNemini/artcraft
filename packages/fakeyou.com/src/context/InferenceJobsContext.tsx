import { createContext } from 'react';

interface InferenceJobsContext { byCategory?: any, enqueue?: any }

export default createContext<InferenceJobsContext>({ });