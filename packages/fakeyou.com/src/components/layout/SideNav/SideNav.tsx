import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faBookOpen,
  faMessageDots,
  faTrophy,
  faWaveformLines,
  faStar,
  faUser,
  faSignOutAlt,
  faFaceViewfinder,
  faCloudUpload,
  faWandMagicSparkles,
  faHome,
  faCompass,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "components/common/Button/Button";
import React, { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import {
  GetQueueStats,
  GetQueueStatsIsOk,
  GetQueueStatsSuccessResponse,
} from "@storyteller/components/src/api/stats/queues/GetQueueStats";
import { WebUrl } from "common/WebUrl";
import { Logout } from "@storyteller/components/src/api/session/Logout";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { FakeYouFrontendEnvironment } from "@storyteller/components/src/env/FakeYouFrontendEnvironment";
import { useLocalize } from "hooks";

const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

interface SideNavProps {
  sessionWrapper: SessionWrapper;
  logoutHandler: () => void;
  querySessionCallback: () => void;
  querySessionSubscriptionsCallback: () => void;
}

export default function SideNav(props: SideNavProps) {
  const { t } = useLocalize("SideNav");
  let history = useHistory();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const fakeYouFrontendEnv = FakeYouFrontendEnvironment.getInstance();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDevelopmentEnv = fakeYouFrontendEnv.isDevelopment();
  const handleNavLinkClick = () => {
    const wrapper = document.getElementById("wrapper");

    if (window.innerWidth < 992) {
      if (wrapper) {
        wrapper.classList.toggle("toggled");
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
    props.querySessionCallback();
    props.querySessionSubscriptionsCallback();
    // PosthogClient.reset();
    // Analytics.accountLogout();
    history.push("/");
  };

  const loggedIn = props.sessionWrapper.isLoggedIn();

  let userOrLoginButton = (
    <>
      <Button
        label={t("loginButton")}
        small
        variant="secondary"
        onClick={() => {
          history.push("/login");
          handleNavLinkClick();
        }}
      />
    </>
  );

  let signupOrLogOutButton = (
    <>
      <Button
        label={t("signUpButton")}
        small
        onClick={() => {
          history.push("/signup");
          handleNavLinkClick();
        }}
      />
    </>
  );

  if (loggedIn) {
    let displayName = props.sessionWrapper.getDisplayName();
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
          label={t("profileButton")}
          small
          variant="secondary"
          onClick={() => {
            history.push(url);
            handleNavLinkClick();
          }}
        />
      </>
    );

    signupOrLogOutButton = (
      <>
        <Button
          icon={faSignOutAlt}
          label={t("logOutButton")}
          small
          variant="danger"
          onClick={async () => {
            await logoutHandler();
            handleNavLinkClick();
          }}
        />
      </>
    );
  }

  // NB(bt,2023-11-28): These are representative of tacotron2 jobs handled by two queueing systems:
  // The legacy queue (tts-inference-job) and the modern queue (inference-job). We'll add both totals
  // while we migrate off of the legacy system, then eventually kill the legacy statistic.
  const ttsQueuedCount =
    queueStats.legacy_tts.pending_job_count +
    queueStats.inference.by_queue.pending_tacotron2_jobs;

  return (
    <div
      id="sidebar-wrapper"
      className={`sidebar ${shouldShowSidebar ? "visible" : ""}`}
    >
      <ul className="sidebar-nav">
        <li>
          <NavLink
            exact={true}
            to="/"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon icon={faHome} className="sidebar-heading-icon" />
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/pricing"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon icon={faStar} className="sidebar-heading-icon" />
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
        <hr className="mb-3 mt-3" />
        <li className="sidebar-heading">AI Tools</li>
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

        <hr className="mb-3 mt-3" />
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
        <li>
          <a href="https://discord.gg/fakeyou" target="_blank" rel="noreferrer">
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
            <FontAwesomeIcon icon={faTrophy} className="sidebar-heading-icon" />
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
        <hr className="mb-3 mt-3" />
        <li className="sidebar-heading">{t("queueTitle")}</li>
        <li className="ps-4 fs-7 mb-5">
          <div>
            {t("queueTts")}: <span className="text-red">{ttsQueuedCount}</span>
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
        </li>
      </ul>
    </div>
  );
}
