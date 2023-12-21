import React from 'react';
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
// import { useTransition } from "@react-spring/web";
import JobItem from './JobItem';
import { useInferenceJobs, useLocalize } from "hooks";
import "./InferenceJobsList.scss";

interface JobsListProps{
  failures: (fail: string) => string,
  jobType: FrontendInferenceJobType,
  onSelect?: (e:any) => any,
}

export default function InferenceJobsList({ failures, jobType, onSelect }: JobsListProps) {
  const { inferenceJobs = [], jobStatusDescription } = useInferenceJobs(jobType);
  const { t } = useLocalize("InferenceJobs");

  // let height = 0;
  // const transitions = useTransition(inferenceJobs,{ not right now });

  return inferenceJobs.length ? <div {...{ className: "face-animator-jobs panel" }}>
    <h5>{ t("core.heading") }</h5>
    { 
      inferenceJobs.map((job: InferenceJob, key: number) =>
        <JobItem {...{
          failures,
          jobStatusDescription,
          jobType,
          key,
          onSelect,
          t,
          // refSet: (ref: any) => console.log(ref),
          ...job }} />).reverse()
    }
  </div> : null;
};