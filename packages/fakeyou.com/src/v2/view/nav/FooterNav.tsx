import React, { useCallback, useEffect, useState } from "react";
import { GitSha } from "@storyteller/components/src/elements/GitSha";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";
import { ModerationIcon } from "../_icons/ModerationIcon";
import { WebUrl } from "../../../common/WebUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitch,
  faDiscord,
  faTwitter,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";
import {
  GetServerInfo,
  GetServerInfoIsOk,
  GetServerInfoSuccessResponse,
} from "@storyteller/components/src/api/server/GetServerInfo";
import {
  GetPendingTtsJobCount,
  GetPendingTtsJobCountIsOk,
  GetPendingTtsJobCountSuccessResponse,
} from "@storyteller/components/src/api/tts/GetPendingTtsJobCount";

const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

interface Props {
  sessionWrapper: SessionWrapper;
}

function FooterNav(props: Props) {
  const [serverInfo, setServerInfo] = useState<
    GetServerInfoSuccessResponse | undefined
  >(undefined);

  const getServerInfo = useCallback(async () => {
    const response = await GetServerInfo();
    if (GetServerInfoIsOk(response)) {
      setServerInfo(response);
    }
  }, []);

  useEffect(() => {
    getServerInfo();
  }, [getServerInfo]);

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
    console.log("new interval", refreshInterval);
    const interval = setInterval(async () => fetch(), refreshInterval);
    fetch();
    return () => clearInterval(interval);
  }, [pendingTtsJobs]);

  let moderationLink = <span />;

  if (props.sessionWrapper.canBanUsers()) {
    moderationLink = (
      <div className="mb-4 mb-lg-0 me-0 me-lg-4">
        <Link to={WebUrl.moderationMain()}>
          <ModerationIcon />
          <span className="ms-2">Mod Controls</span>
        </Link>
      </div>
    );
  }

  let serverGitSha = <></>;

  if (
    serverInfo !== undefined &&
    !!serverInfo.server_build_sha &&
    serverInfo.server_build_sha !== "undefined"
  ) {
    serverGitSha = (
      <div className="d-flex flex-column flex-lg-row align-items-center">
        <div className="git-sha">
          API: {serverInfo.server_build_sha.substring(0, 8)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <footer id="footer">
        <div className="footer-bar text-center text-lg-start">
          <div className="container fw-medium">
            TTS Queued:{" "}
            <span className="text-red">{pendingTtsJobs.pending_job_count}</span>
          </div>
        </div>
        <div className="container py-5">
          <div className="row gx-5 gy-5">
            <div className="col-12 col-lg-3 d-flex flex-column gap-4 align-items-center align-items-lg-start">
              <Link to="/">
                <img
                  src="/fakeyou/FakeYou-Logo.png"
                  alt="FakeYou: Cartoon and Celebrity Text to Speech"
                  height="36"
                />
              </Link>
              <div className="d-flex gap-3">
                <a
                  className="social-icon"
                  href={ThirdPartyLinks.FAKEYOU_DISCORD}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Join our Discord Server"
                >
                  <FontAwesomeIcon icon={faDiscord} className="me-2" />
                </a>
                <a
                  className="social-icon"
                  href={ThirdPartyLinks.FAKEYOU_TWITTER_WITH_FOLLOW_INTENT}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow us on Twitter"
                >
                  <FontAwesomeIcon icon={faTwitter} className="me-2" />
                </a>
                <a
                  className="social-icon"
                  href={ThirdPartyLinks.FAKEYOU_TIKTOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow us on Tiktok"
                >
                  <FontAwesomeIcon icon={faTiktok} className="me-2" />
                </a>
                <a
                  className="social-icon"
                  href={ThirdPartyLinks.FAKEYOU_TWITCH}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Subscribe to our Twitch Channel"
                >
                  <FontAwesomeIcon icon={faTwitch} className="me-2" />
                </a>
              </div>
            </div>
            <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
              <p className="fw-bold">AI Tools</p>
              <li>
                <Link to="/tts">Text to Speech</Link>
              </li>

              <li>
                <Link to="/voice-conversion">Voice Conversion</Link>
              </li>

              <li>
                <Link to="/video">Video Lipsync</Link>
              </li>
            </div>
            <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
              <p className="fw-bold">Community</p>

              <li>
                <Link to="/contribute">Upload</Link>
              </li>

              <li>
                <Link to="/leaderboard">Leaderboard</Link>
              </li>

              <li>
                <Link to="/firehose">Feed</Link>
              </li>
            </div>
            <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
              <p className="fw-bold">Info</p>
              <li>
                <Link to={WebUrl.pricingPageWithReferer("footer")}>
                  Pricing
                </Link>
              </li>

              <li>
                <Link to={WebUrl.aboutUsPage()}>About</Link>
              </li>

              <li>
                <Link to={WebUrl.termsPage()}>Terms of Use</Link>
              </li>

              <li>
                <Link to={WebUrl.privacyPage()}>Privacy Policy</Link>
              </li>
              <li>
                <a href={WebUrl.developerDocs()}>API Docs</a>
              </li>
            </div>
          </div>

          <div className="pt-4">
            <hr />
          </div>

          <div className="d-flex flex-column flex-lg-row pt-2 align-items-center gap-0 gap-lg-4">
            <span className="flex-grow-1">
              © 2023 FakeYou by{" "}
              <a href="https://storyteller.ai" target="_blank" rel="noreferrer">
                Storyteller.ai
              </a>
            </span>
            <div className="d-flex flex-column flex-lg-row align-items-center mt-4 mt-lg-0">
              {moderationLink}
            </div>

            {serverGitSha}

            <div className="d-flex flex-column flex-lg-row align-items-center">
              <GitSha prefix="FE: " />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { FooterNav };
