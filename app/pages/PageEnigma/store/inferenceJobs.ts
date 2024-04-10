import { signal } from "@preact/signals-core";

import { InferenceJob } from "../models";

export const inferenceJobs = signal<InferenceJob[]>([]);

export function addInferenceJob(
  newJob: InferenceJob){
  const existingInferenceJobs = inferenceJobs.value;
  const jobExist = existingInferenceJobs.find(job=>job.job_id==newJob.job_id)
  if(!jobExist){
    inferenceJobs.value = [...existingInferenceJobs, newJob]
  };
  // else do nothing
}

export function updateInferenceJob(
  updatableJob: InferenceJob){
  const existingInferenceJobs = inferenceJobs.value;
  existingInferenceJobs.forEach(job=>{
    if(job.job_id === updatableJob.job_id){
      job.job_status = updatableJob.job_status
    }
    if(updatableJob.result){
      job.result = updatableJob.result;
    }
  })
  inferenceJobs.value = [...existingInferenceJobs];
}