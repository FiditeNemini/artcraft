import { signal } from "@preact/signals-core";

import { InferenceJob } from "../models";

export const inferenceJobs = signal<InferenceJob[]>([]);

export function addInferenceJob(
  inferenceJob: InferenceJob){
  const existingInferenceJobs = inferenceJobs.value;
  existingInferenceJobs.push(inferenceJob);
  inferenceJobs.value = [...existingInferenceJobs];
}

export function updateInferenceJob(
  inferenceJob: InferenceJob){
  const existingInferenceJobs = inferenceJobs.value;
  existingInferenceJobs.forEach(job=>{
    if(job.job_id === inferenceJob.job_id){
      job.job_status = inferenceJob.job_status
    }
  })
  inferenceJobs.value = [...existingInferenceJobs];
}