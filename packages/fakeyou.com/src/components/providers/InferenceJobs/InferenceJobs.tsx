import React from 'react';
import { InferenceJobsContext } from 'context';

interface Props {
  children?: any;
  // enqueue?: any;
  // byCategory?: any;
}

export default function InferenceJobs({  children, ...value }: Props) {
	return <InferenceJobsContext.Provider {...{ value }}>
		{ children }
	</InferenceJobsContext.Provider>
};