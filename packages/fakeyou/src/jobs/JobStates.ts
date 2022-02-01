export enum JobState {
  UNKNOWN, // Only on frontend.
  PENDING,
  STARTED,
  COMPLETE_SUCCESS,
  COMPLETE_FAILURE,
  ATTEMPT_FAILED,
  DEAD,
}

export function jobStateFromString(jobStateString: string) : JobState {
  switch (jobStateString) {
    case 'pending':
      return JobState.PENDING;
    case 'started':
      return JobState.STARTED;
    case 'complete_success':
      return JobState.COMPLETE_SUCCESS;
    case 'complete_failure':
      return JobState.COMPLETE_FAILURE;
    case 'attempt_failed':
      return JobState.ATTEMPT_FAILED;
    case 'dead':
      return JobState.DEAD;
  }

  return JobState.UNKNOWN;
}


export function jobStateCanChange(jobState: JobState) : boolean {
  switch (jobState) {
    case JobState.UNKNOWN:
    case JobState.PENDING:
    case JobState.STARTED:
    case JobState.ATTEMPT_FAILED:
      return true;
    case JobState.COMPLETE_SUCCESS:
    case JobState.COMPLETE_FAILURE:
    case JobState.DEAD:
    default:
      return false;
  }
}