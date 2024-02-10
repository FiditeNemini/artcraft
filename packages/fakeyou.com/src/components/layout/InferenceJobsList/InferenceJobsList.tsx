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
import { Button, Panel } from "components/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/pro-solid-svg-icons";

interface JobsListProps {
  failures: (fail: string) => string;
  jobType?: FrontendInferenceJobType;
  value?: JobListTypes;
  onSelect?: (e: any) => any;
  panel?: boolean;
  showNoJobs?: boolean;
  showHeader?: boolean;
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
  panel = true,
  showNoJobs = false,
  showHeader = true,
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

  const jobContent = (
    <>
      {showHeader && <h3 className="fw-semibold mb-3">{t("core.heading")}</h3>}
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
        <div className="d-flex flex-column p-4 gap-3 text-center align-items-center">
          <FontAwesomeIcon icon={faClipboardList} className="display-6 mb-2" />
          <div>
            <h2 className="fw-semibold mb-1">{t("core.noJobsTitle")}</h2>
            <p className="opacity-75 mb-2">{t("core.noJobsSubtitle")}</p>
          </div>

          <Button label={t("core.exploreBtn")} to="/explore" />
        </div>
      )}
    </>
  );

  if (inferenceJobs.length || showNoJobs) {
    return (
      <>
        {panel ? (
          <Panel
            {...{ className: "fy-inference-jobs-list rounded", padding: true }}
          >
            {jobContent}
          </Panel>
        ) : (
          jobContent
        )}
      </>
    );
  } else {
    return null;
  }
}
