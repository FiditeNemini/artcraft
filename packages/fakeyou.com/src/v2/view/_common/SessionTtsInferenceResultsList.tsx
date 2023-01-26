import React, { useEffect, useState } from "react";
import { t } from "i18next";
import { Trans } from "react-i18next";
import { Link } from "react-router-dom";
import { TtsInferenceJob } from "../../../App";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faLink,
  faHeadphonesSimple,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { container, sessionItem } from "../../../data/animation";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { Analytics } from "../../../common/Analytics";
import { SessionTtsAudioPlayer } from "./SessionTtsAudioPlayer";
import { WebUrl } from "../../../common/WebUrl";
import {
  GetPendingTtsJobCount,
  GetPendingTtsJobCountIsOk,
  GetPendingTtsJobCountSuccessResponse,
} from "@storyteller/components/src/api/tts/GetPendingTtsJobCount";

interface Props {
  ttsInferenceJobs: Array<TtsInferenceJob>;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function SessionTtsInferenceResultList(props: Props) {
  const [pendingTtsJobs, setPendingTtsJobs] =
    useState<GetPendingTtsJobCountSuccessResponse>({
      success: true,
      pending_job_count: 0,
      cache_time: new Date(0), // NB: Epoch is used for vector clock's initial state
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
    const interval = setInterval(async () => fetch(), 15000);
    fetch();
    return () => clearInterval(interval);
  }, [pendingTtsJobs]);

  let results: Array<JSX.Element> = [];

  props.ttsInferenceJobs.forEach((job) => {
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
              <motion.div className={cssStyle} variants={sessionItem}>
                {stateDescription}
              </motion.div>
            </div>
          </div>
        </div>
      );
    } else {
      let audioLink = new BucketConfig().getGcsUrl(
        job.maybePublicBucketWavAudioPath
      );
      let ttsPermalink = `/tts/result/${job.maybeResultToken}`;

      let wavesurfers = <SessionTtsAudioPlayer filename={audioLink} />;

      results.push(
        <div key={job.jobToken}>
          {/*<div className="message-header">
              <p>{job.title}</p>
              <button className="delete" aria-label="delete"></button>
            </div>*/}
          <div>
            <motion.div
              className="panel panel-tts-results p-4 gap-3 d-flex flex-column"
              variants={sessionItem}
            >
              <div>
                <h5 className="mb-2">{job.title}</h5>
                <p>{job.rawInferenceText}</p>
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
                <Link
                  to={ttsPermalink}
                  onClick={() => {
                    Analytics.ttsClickResultLink();
                  }}
                  className="fw-semibold"
                >
                  <FontAwesomeIcon icon={faLink} className="me-2" />
                  {t("common.SessionTtsInferenceResults.result.shareDownload")}
                </Link>
              </div>
            </motion.div>
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

  let upgradeNotice = <></>;

  // Ask non-premium users to upgrade
  if (
    results.length !== 0 &&
    !props.sessionSubscriptionsWrapper.hasPaidFeatures()
  ) {
    upgradeNotice = (
      <div className="d-flex flex-column gap-3 sticky-top zi-2">
        <motion.div
          className="alert alert-warning alert-cta mb-0"
          variants={sessionItem}
        >
          <FontAwesomeIcon icon={faClock} className="me-2" />
          <Trans i18nKey="common.SessionTtsInferenceResults.premium.ad">
            Don't want to wait? Step to the back of the line with a{" "}
            <Link
              to={WebUrl.pricingPageWithReferer("nowait")}
              onClick={() => {
                Analytics.ttsTooSlowUpgradePremium();
              }}
              className="alert-link fw-semibold"
            >
              FakeYou membership.
            </Link>
          </Trans>{" "}
          (TTS Queued:{" "}
          <span className="text-red">~{pendingTtsJobs.pending_job_count}</span>)
        </motion.div>
      </div>
    );
  }

  // Users have requested reverse chronological results
  results.reverse();

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div>
        <div className="d-flex flex-column gap-3">
          {upgradeNotice}
          <div className="d-flex flex-column gap-3">{results}</div>
        </div>
      </div>
    </motion.div>
  );
}

export { SessionTtsInferenceResultList };
