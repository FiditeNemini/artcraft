import React from 'react';
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
// import { springs } from "resources";
import JobItem from './JobItem';
import { useInferenceJobs, useLocalize } from "hooks";
import "./InferenceJobsList.scss";

interface JobsListProps{
  jobType: FrontendInferenceJobType,
  onSelect?: (e:any) => any,
}

export default function InferenceJobsList({ jobType, onSelect }: JobsListProps) {
  const { inferenceJobs = [], jobStatusDescription } = useInferenceJobs(jobType);
  const { t } = useLocalize("InferenceJobs");

  return inferenceJobs.length ? <div {...{ className: "face-animator-jobs panel" }}>
    <h5>{ t("core.heading") }</h5>
    { inferenceJobs.map((job: InferenceJob, key: number) => <JobItem {...{ jobStatusDescription, jobType, key, onSelect, t, ...job }} />).reverse() }
  </div> : null;
};