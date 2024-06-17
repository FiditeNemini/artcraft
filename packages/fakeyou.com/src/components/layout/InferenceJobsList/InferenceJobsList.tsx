import React from "react";
import {
  AllInferenceJobs,
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
// import { useTransition } from "@react-spring/web";
import JobItem from "./JobItem";
import { useInferenceJobs, useLocalize, useSession } from "hooks";
import "./InferenceJobsList.scss";
import { Button, Panel, JobQueueTicker } from "components/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/pro-solid-svg-icons";

interface JobsListProps {
  failures: (fail: string) => string;
  jobType?: FrontendInferenceJobType | AllInferenceJobs;
  onSelect?: (e: any) => any;
  panel?: boolean;
  showJobQueue?: boolean;
  showNoJobs?: boolean;
  showHeader?: boolean;
}

const resultPaths = {
  EngineComposition: "/media",
  FaceAnimation: "/media",
  TextToSpeech: "/media",
  VideoStyleTransfer: "/media",
  VoiceConversion: "/media",
  VoiceDesignerCreateVoice: "/voice-designer/voice",
  VoiceDesignerTts: "/media",
  ImageGeneration: "/media",
};

export default function InferenceJobsList({
  failures,
  jobType,
  onSelect,
  panel = true,
  showHeader = true,
  showJobQueue = false,
  showNoJobs = false,
}: JobsListProps) {
  const { sessionSubscriptions } = useSession();
  const hasPaidFeatures = sessionSubscriptions?.hasPaidFeatures();
  const {
    inferenceJobs = [],
    inferenceJobsByCategory,
    jobStatusDescription,
  } = useInferenceJobs();
  const { t } = useLocalize("InferenceJobs");
  const selectedJobs =
    jobType === undefined || jobType === AllInferenceJobs.All
      ? inferenceJobs
      : inferenceJobsByCategory.get(jobType);

  const jobContent = (
    <>
      {showHeader && <h3 className="fw-semibold mb-3">{t("core.heading")}</h3>}
      {showJobQueue && <JobQueueTicker {...{ hasPaidFeatures }} />}
      <div {...{ className: "fy-inference-jobs-list-grid" }}>
        {selectedJobs &&
          selectedJobs.map((job: InferenceJob, key: number) => (
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
          ))}
      </div>
      {(!selectedJobs || !selectedJobs.length) && showNoJobs && (
        <div className="d-flex flex-column p-4 gap-3 text-center align-items-center">
          <FontAwesomeIcon icon={faClipboardList} className="display-6 mb-2" />
          <div>
            <h4 className="fw-semibold mb-1">{t("core.noJobsTitle")}</h4>
            <p className="opacity-75 mb-2">{t("core.noJobsSubtitle")}</p>
          </div>

          <Button label={t("core.exploreBtn")} to="/explore" />
        </div>
      )}
    </>
  );

  if (selectedJobs || showNoJobs) {
    return (
      <>
        {panel ? (
          <Panel
            {...{ className: "fy-inference-jobs-list rounded", padding: true }}
          >
            {jobContent}
          </Panel>
        ) : (
          <>{jobContent}</>
        )}
      </>
    );
  } else {
    return null;
  }
}
