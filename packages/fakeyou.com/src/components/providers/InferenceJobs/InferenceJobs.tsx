import React from 'react';
import { InferenceJobsContext } from 'context';

interface Props {
  children?: any;
  enqueue?: any;
  byCategory?: any;
}

export default function InferenceJobs({ byCategory, children, enqueue }: Props) {
	return <InferenceJobsContext.Provider {...{ value: { byCategory, enqueue } }}>
		{ children }
	</InferenceJobsContext.Provider>
};