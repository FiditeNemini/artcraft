import React, { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowsTurnToDots,
  faBookOpen,
  faCameraMovie,
  faCompass,
  faCloudUpload,
  faFaceViewfinder,
  faHome,
  faMessageDots,
  faMessageImage,
  faPersonRays,
  faSignOutAlt,
  faStar,
  faTrophy,
  faUser,
  faWandMagicSparkles,
  faWaveformLines,
  faTransporter,
  faClipboardList
} from "@fortawesome/pro-solid-svg-icons";

import {
  GetQueueStats,
  GetQueueStatsIsOk,
  GetQueueStatsSuccessResponse,
} from "@storyteller/components/src/api/stats/queues/GetQueueStats";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { FakeYouFrontendEnvironment } from "@storyteller/components/src/env/FakeYouFrontendEnvironment";
import { useLocalize } from "hooks";
import { Logout } from "@storyteller/components/src/api/session/Logout";
import { Button } from "components/common";
import { WebUrl } from "common/WebUrl";

const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

interface SideNavProps {
  sessionWrapper: SessionWrapper;
  logoutHandler: () => void;
  querySessionCallback: () => void;
  querySessionSubscriptionsCallback: () => void;
}

export default function SideNav({
  sessionWrapper,
  querySessionCallback,
  querySessionSubscriptionsCallback,
}: SideNavProps) {
  const { t } = useLocalize("SideNav");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const fakeYouFrontendEnv = FakeYouFrontendEnvironment.getInstance();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDevelopmentEnv = fakeYouFrontendEnv.isDevelopment();
  const wrapper = document.getElementById("wrapper");
  const isMenuOpen = wrapper?.classList.contains("toggled");

  let history = useHistory();
  const handleNavLinkClick = () => {
    if (window.innerWidth < 992) {
      if (wrapper) {
        wrapper.classList.toggle("toggled");
        // Dispatch the event here after toggling the class (Links with the TopNav menu icon change)
        window.dispatchEvent(
          new CustomEvent("menuToggle", { detail: { isOpen: isMenuOpen } })
        );
      }
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const wrapper = document.getElementById("wrapper");
      const overlay = document.getElementById("overlay");

      if (
        (!wrapper?.contains(event.target as Node) ||
          overlay?.contains(event.target as Node)) &&
        window.innerWidth < 992
      ) {
        wrapper?.classList.remove("toggled");
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup listener on unmount
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const shouldShowSidebar = windowWidth >= 992;

  useEffect(() => {
    const contentWrapper = document.getElementById("page-content-wrapper");

    if (windowWidth >= 992) {
      contentWrapper?.classList.remove("no-padding");
    } else {
      contentWrapper?.classList.add("no-padding");
    }
  }, [windowWidth]);

  const [queueStats, setQueueStats] = useState<GetQueueStatsSuccessResponse>({
    success: true,
    cache_time: new Date(0), // NB: Epoch is used for vector clock's initial state
    refresh_interval_millis: DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
    inference: {
      total_pending_job_count: 0,
      pending_job_count: 0,
      by_queue: {
        pending_face_animation_jobs: 0,
        pending_rvc_jobs: 0,
        pending_svc_jobs: 0,
        pending_tacotron2_jobs: 0,
        pending_voice_designer: 0,
      },
    },
    legacy_tts: {
      pending_job_count: 0,
    },
  });

  useEffect(() => {
    const fetch = async () => {
      const response = await GetQueueStats();
      if (GetQueueStatsIsOk(response)) {
        if (response.cache_time.getTime() > queueStats.cache_time.getTime()) {
          setQueueStats(response);
        }
      }
    };
    // TODO: We're having an outage and need to lower this.
    //const interval = setInterval(async () => fetch(), 15000);
    const refreshInterval = Math.max(
      DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
      queueStats.refresh_interval_millis
    );
    const interval = setInterval(async () => fetch(), refreshInterval);
    fetch();
    return () => clearInterval(interval);
  }, [queueStats]);

  const logoutHandler = async () => {
    await Logout();
    querySessionCallback();
    querySessionSubscriptionsCallback();
    // PosthogClient.reset();
    // Analytics.accountLogout();
    history.push("/");
  };

  const loggedIn = sessionWrapper.isLoggedIn();

  let userOrLoginButton = (
    <>
      <Button
        label="Login"
        small
        variant="secondary"
        onClick={() => {
          history.push("/login");
        }}
      />
    </>
  );

  let signupOrLogOutButton = (
    <>
      <Button
        label="Sign Up"
        small
        onClick={() => {
          history.push("/signup");
        }}
      />
    </>
  );

  if (loggedIn) {
    let displayName = sessionWrapper.getDisplayName();
    // let gravatarHash = props.sessionWrapper.getEmailGravatarHash();
    // let gravatar = <span />;

    if (displayName === undefined) {
      displayName = "My Account";
    }

    let url = WebUrl.userProfilePage(displayName);
    userOrLoginButton = (
      <>
        <Button
          icon={faUser}
          label="My Profile"
          small
          variant="secondary"
          onClick={() => {
            history.push(url);
          }}
        />
      </>
    );

    signupOrLogOutButton = (
      <>
        <Button
          icon={faSignOutAlt}
          label="Logout"
          small
          variant="danger"
          onClick={async () => {
            await logoutHandler();
          }}
        />
      </>
    );
  }

  if (sessionWrapper.isLoggedIn()) {
    let displayName = sessionWrapper.getDisplayName();
    if (displayName === undefined) {
      displayName = "My Account";
    }
    let url = WebUrl.userProfilePage(displayName);
    userOrLoginButton = (
      <Button
        icon={faUser}
        label="My Profile"
        small
        variant="secondary"
        onClick={() => history.push(url)}
        className="d-block d-lg-none"
      />
    );
  }

  // NB(bt,2023-11-28): These are representative of tacotron2 jobs handled by two queueing systems:
  // The legacy queue (tts-inference-job) and the modern queue (inference-job). We'll add both totals
  // while we migrate off of the legacy system, then eventually kill the legacy statistic.
  const ttsQueuedCount =
    queueStats.legacy_tts.pending_job_count +
    queueStats.inference.by_queue.pending_tacotron2_jobs;

  let maybeVideoGeneration = <></>;

  if (sessionWrapper.canAccessStudio()) {
    maybeVideoGeneration = (
      <>
        <li>
          <NavLink
            to="/video-mocap"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon
              icon={faPersonRays}
              className="sidebar-heading-icon"
            />
            {t("videoMotionCapture")}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/video-workflow"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon
              icon={faArrowsTurnToDots}
              className="sidebar-heading-icon"
            />
            {t("videoWorkflow")}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/studio"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon
              icon={faCameraMovie}
              className="sidebar-heading-icon"
            />
            Storyteller Studio
            {/* {t("videoStorytellerStudio")} */}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/engine-compositor"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon
              icon={faTransporter}
              className="sidebar-heading-icon"
            />
            Engine Compositor
            {/* {t("videoStorytellerStudio")} */}
          </NavLink>
        </li>
      </>
    );
  }

  let maybeImageGeneration = <></>;

  if (sessionWrapper.canAccessStudio()) {
    maybeImageGeneration = (
      <>
        <li className="sidebar-heading">Image Generation</li>
        <li>
          <NavLink
            to="/text-to-image"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon
              icon={faMessageImage}
              className="sidebar-heading-icon"
            />
            Text to Image
            {/* {t("videoStorytellerStudio")} */}
          </NavLink>
        </li>
        <hr className="mb-3 mt-3" />
      </>
    );
  }

  return (
    <>
      <div
        id="sidebar-wrapper"
        className={`sidebar ${shouldShowSidebar ? "visible" : ""}`}
      >
        <div>
          <ul className="sidebar-nav">
            <li>
              <NavLink
                exact={true}
                to="/"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faHome}
                  className="sidebar-heading-icon"
                />
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pricing"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faStar}
                  className="sidebar-heading-icon"
                />
                {t("infoPricing")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/explore"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faCompass}
                  className="sidebar-heading-icon"
                />
                Explore
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/inference-jobs-list"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faClipboardList}
                  className="sidebar-heading-icon"
                />
                My Jobs
              </NavLink>
            </li>
            <hr className="mb-3 mt-3" />
            <li className="sidebar-heading">{t("speechTitle")}</li>
            <li>
              <NavLink
                to="/tts"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faMessageDots}
                  className="sidebar-heading-icon"
                />
                {t("speechTts")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/voice-conversion"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faWaveformLines}
                  className="sidebar-heading-icon"
                />
                {t("speechVc")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/voice-designer"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faWandMagicSparkles}
                  className="sidebar-heading-icon"
                />
                {"Voice Designer"}
              </NavLink>
            </li>
            <hr className="mb-3 mt-3" />
            <li className="sidebar-heading">{t("videoTitle")}</li>
            <li>
              <NavLink
                to="/face-animator"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faFaceViewfinder}
                  className="sidebar-heading-icon"
                />
                {t("videoFaceAnimator")}
              </NavLink>
            </li>

            {maybeVideoGeneration}

            <hr className="mb-3 mt-3" />

            {maybeImageGeneration}

            <li className="sidebar-heading">{t("communityTitle")}</li>
            <li>
              <NavLink
                to="/contribute"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faCloudUpload}
                  className="sidebar-heading-icon"
                />
                {t("communityUploadModels")}
              </NavLink>
            </li>
            <li className="mb-3">
              <a
                href="https://discord.gg/fakeyou"
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon
                  icon={faDiscord}
                  className="sidebar-heading-icon"
                />
                {t("communityDiscord")}
              </a>
              <NavLink
                to="/leaderboard"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faTrophy}
                  className="sidebar-heading-icon"
                />
                {t("communityLeaderboard")}
              </NavLink>
              <NavLink
                to="/guide"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faBookOpen}
                  className="sidebar-heading-icon"
                />
                {t("communityGuide")}
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="mobile-fixed-bottom">
          <div className="d-none d-lg-block">
            <div className="sidebar-heading">Jobs Queue</div>
            <div className="ps-4 mb-3">
              <div>
                {t("queueTts")}:{" "}
                <span className="text-red">{ttsQueuedCount}</span>
              </div>
              <div>
                {t("queueRvc")}:{" "}
                <span className="text-red">
                  {queueStats.inference.by_queue.pending_rvc_jobs}
                </span>
              </div>
              <div>
                {t("queueSvc")}:{" "}
                <span className="text-red">
                  {queueStats.inference.by_queue.pending_svc_jobs}
                </span>
              </div>
              <div>
                {t("queueFaceAnimator")}:{" "}
                <span className="text-red">
                  {queueStats.inference.by_queue.pending_face_animation_jobs}
                </span>
              </div>
              <div>
                Voice Designer:{" "}
                <span className="text-red">
                  {queueStats.inference.by_queue.pending_voice_designer}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 d-flex d-lg-none gap-2 mb-5">
            {userOrLoginButton}
            {signupOrLogOutButton}
          </div>
        </div>
      </div>
    </>
  );
}
