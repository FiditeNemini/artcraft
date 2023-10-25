import React from 'react';
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import { InferenceJobsContext } from 'context';

interface Props {
  children?: any;
  byCategory?: any;
}

export default function InferenceJobs({ children, byCategory }: Props) {
	const processStatus = (job: InferenceJob) => {
    switch (job.jobState) {
      case JobState.PENDING:
      case JobState.UNKNOWN: return 0;
      case JobState.STARTED: return 1
      case JobState.ATTEMPT_FAILED: return 2;
      case JobState.COMPLETE_FAILURE:
      case JobState.DEAD: return 3;
      case JobState.COMPLETE_SUCCESS: return 4;
      default: return -1;
    }
  };
	return <InferenceJobsContext.Provider {...{ value: { byCategory, processStatus } }}>
		{ children }
	</InferenceJobsContext.Provider>
};