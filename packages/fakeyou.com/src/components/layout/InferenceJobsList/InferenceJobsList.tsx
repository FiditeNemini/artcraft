import React from "react";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
// import { useTransition } from "@react-spring/web";
import JobItem from "./JobItem";
import { useInferenceJobs, useLocalize } from "hooks";
import "./InferenceJobsList.scss";
import { Panel } from "components/common";

interface JobsListProps {
  failures: (fail: string) => string;
  jobType: FrontendInferenceJobType;
  onSelect?: (e: any) => any;
  showNoJobs?: boolean;
}

export default function InferenceJobsList({
  failures,
  jobType,
  onSelect,
  showNoJobs = false,
}: JobsListProps) {
  const { inferenceJobs = [], jobStatusDescription } =
    useInferenceJobs(jobType);
  const { t } = useLocalize("InferenceJobs");

  if (inferenceJobs.length || showNoJobs) {
    return (
      <Panel {...{ className: "fy-inference-jobs-list", padding: true }}>
        <h5>{t("core.heading")}</h5>
        {inferenceJobs
          .map((job: InferenceJob, key: number) => (
            <JobItem
              {...{
                failures,
                jobStatusDescription,
                jobType,
                key,
                onSelect,
                t,
                ...job,
              }}
            />
          ))
          .reverse()}
          {!inferenceJobs.length && showNoJobs &&
            <p>Currently, there are current no jobs pending.</p> 
          }
      </Panel>
    );
  } else {
    return null;
  }
}
