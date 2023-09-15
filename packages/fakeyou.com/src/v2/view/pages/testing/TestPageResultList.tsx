import React, { useEffect, useState } from "react";
import { t } from "i18next";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphonesSimple,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { Analytics } from "../../../../common/Analytics";
import {
  GetPendingTtsJobCount,
  GetPendingTtsJobCountIsOk,
  GetPendingTtsJobCountSuccessResponse,
} from "@storyteller/components/src/api/tts/GetPendingTtsJobCount";
import { InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";

interface Props {
  inferenceJobs: Array<InferenceJob>;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

// TODO: This is duplicated in SessionTtsInferenceResultsList !
// Default to querying every 15 seconds, but make it configurable serverside
const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

function TestPageResultList(props: Props) {
  const [pendingTtsJobs, setPendingTtsJobs] =
    useState<GetPendingTtsJobCountSuccessResponse>({
      success: true,
      pending_job_count: 0,
      cache_time: new Date(0), // NB: Epoch is used for vector clock's initial state
      refresh_interval_millis: DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
    });

  useEffect(() => {
    const fetch = async () => {
      const response = await GetPendingTtsJobCount();
      if (GetPendingTtsJobCountIsOk(response)) {
        if (
          response.cache_time.getTime() > pendingTtsJobs.cache_time.getTime()
        ) {
          setPendingTtsJobs(response);
        }
      }
    };
    // TODO: We're having an outage and need to lower this.
    //const interval = setInterval(async () => fetch(), 15000);
    const refreshInterval = Math.max(
      DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
      pendingTtsJobs.refresh_interval_millis
    );
    const interval = setInterval(async () => fetch(), refreshInterval);
    fetch();
    return () => clearInterval(interval);
  }, [pendingTtsJobs]);

  let results: Array<JSX.Element> = [];

  // TODO(bt,2023-04-08): Clean this utter garbage duplication up.

  // ============================= GENERIC INFERENCE =============================

  props.inferenceJobs.forEach((job) => {
    if (!job.maybeResultToken) {
      let cssStyle = "alert alert-secondary mb-0";
      let stateDescription = "Pending...";

      switch (job.jobState) {
        case JobState.PENDING:
        case JobState.UNKNOWN:
          stateDescription =
            job.maybeExtraStatusDescription == null
              ? t("common.SessionTtsInferenceResults.progress.pending")
              : job.maybeExtraStatusDescription;
          break;
        case JobState.STARTED:
          cssStyle = "alert alert-success mb-0";
          stateDescription =
            job.maybeExtraStatusDescription == null
              ? t("common.SessionTtsInferenceResults.progress.started")
              : job.maybeExtraStatusDescription;
          break;
        case JobState.ATTEMPT_FAILED:
          cssStyle = "alert alert-danger mb-0";
          stateDescription = `Failed ${job.attemptCount} attempt(s). Will retry...`;
          break;
        case JobState.COMPLETE_FAILURE:
        case JobState.DEAD:
          cssStyle = "alert alert-danger mb-0";
          // TODO(bt,2023-01-23): Translate when I can test it
          stateDescription = t(
            "common.SessionTtsInferenceResults.progress.dead"
          );
          break;
        case JobState.COMPLETE_SUCCESS:
          cssStyle = "message is-success mb-0";
          // Not sure why we're here instead of other branch!
          stateDescription = t(
            "common.SessionTtsInferenceResults.progress.success"
          );
          break;
      }

      results.push(
        <div key={job.jobToken}>
          <div>
            <div>
              <div className={cssStyle}>{stateDescription}</div>
            </div>
          </div>
        </div>
      );
    } else {
      let audioLink = new BucketConfig().getGcsUrl(
        job.maybeResultPublicBucketMediaPath
      );
      //let ttsPermalink = `/tts/result/${job.maybeResultToken}`;

      //let wavesurfers = <SessionTtsAudioPlayer filename={audioLink} />;
      let wavesurfers : string[] = [];

      let audioDownloadFilename = `fakeyou-${job.jobToken}.wav`;

      results.push(
        <div key={job.jobToken}>
          {/*<div className="message-header">
              <p>{job.title}</p>
              <button className="delete" aria-label="delete"></button>
            </div>*/}
          <div>
            <div className="panel panel-tts-results p-4 gap-3 d-flex flex-column">
              <div>
                <h5 className="mb-2">{job.maybeModelTitle}</h5>
                <p>{job.maybeRawInferenceText}</p>
              </div>

              {/* <audio
                className="w-100"
                controls
                src={audioLink}
                onClick={() => {
                  Analytics.ttsClickResultInlinePlay();
                }}
              >
                Your browser does not support the
                <code>audio</code> element.
              </audio> */}

              {wavesurfers}

              <div className="mt-2">
                {/*<Link
                  to={ttsPermalink}
                  onClick={() => {
                    Analytics.ttsClickResultLink();
                  }}
                  className="fw-semibold"
                >
                  <FontAwesomeIcon icon={faLink} className="me-2" />
                  {t("common.SessionTtsInferenceResults.result.shareDownload")}
                </Link>*/}

                <a
                  className=" btn btn-primary w-100 mt-4"
                  href={audioLink}
                  onClick={() => {
                    Analytics.voiceConversionClickDownload();
                  }}
                  download={audioDownloadFilename}
                >
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Download File{" "}
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  let noResultsSection = (
    <div className="panel panel-inner text-center p-5 rounded-5 h-100">
      <div className="d-flex flex-column opacity-75 h-100 justify-content-center">
        <FontAwesomeIcon icon={faHeadphonesSimple} className="fs-3 mb-3" />
        <h5 className="fw-semibold">
          {t("common.SessionTtsInferenceResults.noResults.title")}
        </h5>
        <p>{t("common.SessionTtsInferenceResults.noResults.subtitle")}</p>
      </div>
    </div>
  );

  if (results.length === 0) {
    return <>{noResultsSection}</>;
  }

  // Users have requested reverse chronological results
  results.reverse();

  return (
    <div>
      <div>
        <div className="d-flex flex-column gap-3">
          <div className="d-flex flex-column gap-3">{results}</div>
        </div>
      </div>
    </div>
  );
}

export { TestPageResultList };
