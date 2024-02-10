import React from "react";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
// import { useTransition } from "@react-spring/web";
import JobItem from "./JobItem";
import { useInferenceJobs, useLocalize } from "hooks";
import { JobListTypes } from "hooks/useInferenceJobs/useInferenceJobs";
import "./InferenceJobsList.scss";
import { Panel } from "components/common";

interface JobsListProps {
  failures: (fail: string) => string;
  jobType?: FrontendInferenceJobType;
  value?: JobListTypes;
  onSelect?: (e: any) => any;
  showNoJobs?: boolean;
}

const resultPaths = {
  FaceAnimation: "/media",
  TextToSpeech: "/media",
  VoiceConversion: "/media",
  VoiceDesignerCreateVoice: "/voice-designer/voice",
  VoiceDesignerTts: "/media",
  ImageGeneration: "/media",
};

export default function InferenceJobsList({
  failures,
  jobType,
  value,
  onSelect,
  showNoJobs = false,
}: JobsListProps) {
  // undefined specified here to allow 0.
  // jobType + 1 because the difference between FrontendInferenceJobType and JobListTypes is an "all" option

  const jobValue =
    value !== undefined
      ? value
      : jobType !== undefined
        ? (jobType || 0) + 1
        : 0;

  const { inferenceJobs = [], jobStatusDescription } =
    useInferenceJobs(jobValue);
  const { t } = useLocalize("InferenceJobs");

  if (inferenceJobs.length || showNoJobs) {
    return (
      <Panel
        {...{ className: "fy-inference-jobs-list rounded", padding: true }}
      >
        <h5>{t("core.heading")}</h5>
        {inferenceJobs
          .map((job: InferenceJob, key: number) => (
            <JobItem
              {...{
                failures,
                jobStatusDescription,
                key,
                onSelect,
                resultPaths,
                t,
                ...job,
              }}
            />
          ))
          .reverse()}
        {!inferenceJobs.length && showNoJobs && (
          <p>Currently, there are current no jobs pending.</p>
        )}
      </Panel>
    );
  } else {
    return null;
  }
}
