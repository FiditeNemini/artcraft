import React from "react";
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import { Link } from "react-router-dom";
// import { useTransition } from "@react-spring/web";
import JobItem from "./JobItem";
import { useInferenceJobs,  useLocalize, useSession } from "hooks";
import { JobListTypes } from "hooks/useInferenceJobs/useInferenceJobs";
import "./InferenceJobsList.scss";
import { Button, Panel } from "components/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/pro-solid-svg-icons";
import { WebUrl } from "common/WebUrl";
import { Analytics } from "common/Analytics";

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
  EngineComposition: "/media",
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
  const jobValue = value !== undefined ? value : jobType !== undefined ? (jobType || 0) + 1 : 0;
  // undefined specified here to allow 0.
  // jobType + 1 because the difference between FrontendInferenceJobType and JobListTypes is an "all" option

  const { sessionSubscriptions } = useSession();
  const hasPaidFeatures = sessionSubscriptions?.hasPaidFeatures();
  const { inferenceJobs = [], jobStatusDescription, queueStats } = useInferenceJobs(jobValue);
  const { inference, legacy_tts } = queueStats;

  const { t } = useLocalize("InferenceJobs");

  const jobContent = (
    <>
      {showHeader &&<h3 className="fw-semibold mb-3">{t("core.heading")}</h3>}
      <div {...{ className: "fy-job-queue-ticker" }}>
        <header>
          <h6>
            Jobs queue
          </h6>
          { !hasPaidFeatures && <div {...{ className: "cta-memembership" }}>
            <Link {...{
              className: "cta-membership-gradient",
              onClick: () => Analytics.ttsTooSlowUpgradePremium(),
              to: WebUrl.pricingPageWithReferer("nowait")
            }}>
              <svg {...{ className: "job-cta-clock" }}>
                <mask {...{ id: "job-list-clockhand" }}>

                  <circle {...{ className: "mask-circle", cx: 21, cy: 21, r: 21 }}/>
                  <path d="M21.9,5.96c.22,4.4.6,12.44.6,15.04,0,.86-.5,1.46-1.5,1.46s-1.5-.52-1.5-1.46c0-3.14.37-10.75.59-15,.05-.95.43-1.28.87-1.28s.89.32.94,1.25Z" fill="black" />

                </mask>
                <circle {...{ className: "clock-circle", cx: 21, cy: 21, r: 21, mask: "url(#job-list-clockhand)" }}/>
              </svg>
              <div {...{ className: "job-cta-message" }}>
                Don't want to wait?<br />
                Skip to the front of the queue with a <span>FakeYou membership</span>
              </div>
            </Link>
          </div> }
        </header>
        <div {...{ className: "fy-job-queue-grid" }}>
          <div>
            <div>Text To Speech</div>
            { legacy_tts.pending_job_count + inference.by_queue.pending_tacotron2_jobs }
          </div>
          <div>
            <div>RVC</div>
            { inference.by_queue.pending_rvc_jobs }
          </div>
          <div>
            <div>SVC</div>
            { inference.by_queue.pending_svc_jobs }
          </div>
          <div>
            <div>Image Geneneration</div>
            { inference.by_queue.pending_stable_diffusion }
          </div>
          <div>
            <div>Face Animation</div>
            { inference.by_queue.pending_face_animation_jobs }
          </div>
          <div>
            <div>Voice Designer</div>
            { inference.by_queue.pending_voice_designer }
          </div>
        </div>
      </div>
      <div {...{ className: "fy-inference-jobs-list-grid" }}>
        { inferenceJobs.map((job: InferenceJob, key: number) => 
          <JobItem {...{
            failures,
            jobStatusDescription,
            key,
            onSelect,
            resultPaths,
            t,
            ...job,
          }}/>
        ).reverse() }
      </div>
      {!inferenceJobs.length && showNoJobs && (
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

  if (inferenceJobs.length || showNoJobs) {
    return <>
        { panel ? <Panel {...{ className: "fy-inference-jobs-list rounded", padding: true }}>
            { jobContent }
          </Panel> :
          <>{ jobContent }</>
        }
      </>;
  } else {
    return null;
  }
}
