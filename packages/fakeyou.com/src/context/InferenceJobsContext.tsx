import { createContext } from 'react';

interface InferenceJobsContext { inferenceJobs?: any, byCategory?: any, enqueue?: any }

export default createContext<InferenceJobsContext>({ });