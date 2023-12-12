import React from 'react';
import { InferenceJobsContext } from 'context';

interface Props {
  children?: any;
  byCategory?: any;
}

export default function InferenceJobs({ children, byCategory }: Props) {
	return <InferenceJobsContext.Provider {...{ value: { byCategory } }}>
		{ children }
	</InferenceJobsContext.Provider>
};