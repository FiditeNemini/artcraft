import { useEffect, useCallback } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { inferenceJobs, updateInferenceJob } from '~/pages/PageEnigma/store/inferenceJobs';

export enum JobState {
  UNKNOWN = "unknown", // Only on frontend.
  PENDING = "pending",
  STARTED = "started",
  COMPLETE_SUCCESS = "complete_success",
  COMPLETE_FAILURE = "complete_failure",
  ATTEMPT_FAILED = "attempt_failed",
  DEAD = "dead",
  CANCELED_BY_USER = "canceled_by_user",
}
export interface RequestDetails {
  inference_category: string,
  maybe_model_type?: string,
  maybe_model_token?: string,
  maybe_model_title?: string,
  maybe_raw_inference_text?: string,
}

export interface StatusDetails {
  status: string,
  maybe_extra_status_description?: string,
  maybe_failure_category?: string,
  attempt_count: number,
}

export interface ResultDetails {
  entity_type: string,
  entity_token: string,
  maybe_public_bucket_media_path?: string,
}

export interface JobStatus {
  job_token: string,
  request: RequestDetails,
  status: StatusDetails,
  maybe_result?: ResultDetails,
  created_at: Date,
  updated_at: Date,
}

export interface GetJobStatusResponse {
  success: boolean;
  state: JobStatus
}
type ErrorResponse = {
  success: boolean;
  error_reason: string;
}
export async function GetInferenceJobStatus(jobToken:string) : Promise<GetJobStatusResponse | null> {

  const endpoint = `https://api.fakeyou.com/v1/model_inference/job_status/${jobToken}`;
  
  return await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    // credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : GetJobStatusResponse = res;
    return response;
  })
  .catch(e => {
    return null;
  });
}

function shouldKeepPolling(currStatus:string){
  if(currStatus === JobState.PENDING 
    || currStatus === JobState.STARTED
  ) return true;
  return false
}

export const useInferenceJobManager = () => {
  useSignals();

  const pollInferenceJobs = useCallback(()=>{
    if(inferenceJobs.value.length > 0 ){
      inferenceJobs.value.forEach(job=>{
        if(shouldKeepPolling(job.job_status)){
          GetInferenceJobStatus(job.job_id).then((res:GetJobStatusResponse|null)=>{
            if(res!==null){
              if(res.state.status.status !== job.job_status){
                console.log(`${res.state.job_token} has new state: ${res.state.status.status}`)
                if(res.state.status.status === JobState.COMPLETE_SUCCESS){
                  console.log(res.state);
                  updateInferenceJob({
                    ...job,
                    job_status: res.state.status.status,
                    result: res.state.maybe_result
                  });
                }else{
                  updateInferenceJob({
                    ...job,
                    job_status: res.state.status.status
                  });
                }
              }
            }
          });
        }
      });
    }
  }, []);

  useEffect(()=>{
    console.log('useInferenceJobManager Mounted');
    const intervalTimer = setInterval(pollInferenceJobs,2000);
    return()=>{
      console.log('useInferenceJobManager Dismounted');
      clearInterval(intervalTimer);
    }
  },[]);
};

