import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faBookOpen,
  faMessageDots,
  faTrophy,
  faVideo,
  faWaveformLines,
  faStar,
  faUser,
  faSignOutAlt,
  faFaceViewfinder,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "components/common/Button/Button";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useHistory, useRouteMatch } from "react-router-dom";
import {
  GetQueueStats,
  GetQueueStatsIsOk,
  GetQueueStatsSuccessResponse,
} from "@storyteller/components/src/api/stats/queues/GetQueueStats";
import { WebUrl } from "common/WebUrl";
import { Logout } from "@storyteller/components/src/api/session/Logout";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

interface SideNavProps {
  sessionWrapper: SessionWrapper;
  logoutHandler: () => void;
  querySessionCallback: () => void;
  querySessionSubscriptionsCallback: () => void;
}

export default function SideNav(props: SideNavProps) {
  let history = useHistory();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  const matchHome = useRouteMatch({
    path: "/",
    exact: true,
  });

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

  const shouldShowSidebar = windowWidth >= 992 && matchHome;

  useEffect(() => {
    const wrapper = document.getElementById("wrapper");

    if (windowWidth >= 992) {
      if (matchHome) {
        wrapper?.classList.add("no-padding");
      } else {
        wrapper?.classList.remove("no-padding");
      }
    }
  }, [matchHome, windowWidth]);

  const [queueStats, setQueueStats] = useState<GetQueueStatsSuccessResponse>({
    success: true,
    cache_time: new Date(0), // NB: Epoch is used for vector clock's initial state
    refresh_interval_millis: DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
    inference: {
      total_pending_job_count: 0,
      pending_job_count: 0,
      by_queue: {
        pending_svc_jobs: 0,
        pending_rvc_jobs: 0,
        pending_face_animation_jobs: 0,
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
        label="Login"
        small
        secondary
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
        label="Sign Up"
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
          label="Profile"
          small
          secondary
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
          label="Log Out"
          small
          danger
          onClick={async () => {
            await logoutHandler();
            handleNavLinkClick();
          }}
        />
      </>
    );
  }

  return (
    <div
      id="sidebar-wrapper"
      className={`sidebar ${shouldShowSidebar ? "" : "visible"}`}
    >
      <ul className="sidebar-nav">
        <div className="sidebar-brand">
          <Link to="/" onClick={handleNavLinkClick}>
            <img
              src="/fakeyou/FakeYou-Logo.png"
              alt="FakeYou: Cartoon and Celebrity Text to Speech"
              height="36"
            />
          </Link>
        </div>
        <div className="sidebar-buttons d-flex gap-2 mt-4">
          {userOrLoginButton}
          {signupOrLogOutButton}
        </div>
        <hr className="my-4" />

        <li className="sidebar-heading">Speech Generation</li>
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
            Text to Speech
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
            Voice to Voice
          </NavLink>
        </li>
        <hr className="mb-4 mt-3" />
        <li className="sidebar-heading">Video Generation</li>
        <li>
          <NavLink
            to="/face-animation"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon
              icon={faFaceViewfinder}
              className="sidebar-heading-icon"
            />
            Face Animator
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/video"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon icon={faVideo} className="sidebar-heading-icon" />
            Video Lipsync
          </NavLink>
        </li>

        <hr className="mb-4 mt-3" />
        <li className="sidebar-heading">Community</li>
        <li>
          <a href="https://discord.gg/fakeyou" target="_blank" rel="noreferrer">
            <FontAwesomeIcon
              icon={faDiscord}
              className="sidebar-heading-icon"
            />
            Discord
          </a>
          <NavLink
            to="/leaderboard"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon icon={faTrophy} className="sidebar-heading-icon" />
            Leaderboard
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
            Guide
          </NavLink>
        </li>
        <hr className="mb-3 mt-3" />
        <li>
          <NavLink
            to="/pricing"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon icon={faStar} className="sidebar-heading-icon" />
            Pricing
          </NavLink>
        </li>
        <hr className="mb-4 mt-3" />
        <li className="sidebar-heading">Service Queues</li>
        <li className="ps-4 fs-7">
          <div>
            TTS Queued:{" "}
            <span className="text-red">
              {queueStats.legacy_tts.pending_job_count}
            </span>
          </div>
          <div>
            RVC Queued:{" "}
            <span className="text-red">
              {queueStats.inference.by_queue.pending_rvc_jobs}
            </span>
          </div>
          <div>
            SVC Queued:{" "}
            <span className="text-red">
              {queueStats.inference.by_queue.pending_svc_jobs}
            </span>
          </div>
          <div>
            Animations Queued:{" "}
            <span className="text-red">
              {queueStats.inference.by_queue.pending_face_animation_jobs}
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}
