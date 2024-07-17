import React, { useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowsTurnToDots,
  faBookOpen,
  // faCameraMovie,
  faCompass,
  faCloudUpload,
  faFilms,
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
  // faTransporter,
  faClipboardList,
  faFilm,
} from "@fortawesome/pro-solid-svg-icons";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { GetDiscordLink } from "@storyteller/components/src/env/GetDiscordLink";
import { FakeYouFrontendEnvironment } from "@storyteller/components/src/env/FakeYouFrontendEnvironment";
import { useInferenceJobs, useLocalize } from "hooks";
import { Logout } from "@storyteller/components/src/api/session/Logout";
import { Button } from "components/common";
import { WebUrl } from "common/WebUrl";
import {
  WebsiteConfig,
  Website,
} from "@storyteller/components/src/env/GetWebsite";
import { useDomainConfig } from "context/DomainConfigContext";

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
  const { queueStats } = useInferenceJobs();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const fakeYouFrontendEnv = FakeYouFrontendEnvironment.getInstance();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDevelopmentEnv = fakeYouFrontendEnv.isDevelopment();
  const wrapper = document.getElementById("wrapper");
  const isMenuOpen = wrapper?.classList.contains("toggled");
  const isLoggedIn = sessionWrapper.isLoggedIn();
  const isOnLandingPage = window.location.pathname === "/";
  const isOnLoginPage = window.location.pathname.includes("/login");
  const isOnSignUpPage = window.location.pathname.includes("/signup");
  const isOnStudioPage = window.location.pathname.includes("/studio");
  const isOnProfilePage = window.location.pathname.includes("/profile/");
  const isOnBetaKeyRedeemPage =
    window.location.pathname.includes("/beta-key/redeem");
  const domain: WebsiteConfig = useDomainConfig();

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

  const shouldNotShowSidebar =
    (!isLoggedIn &&
      (isOnLandingPage ||
        isOnLoginPage ||
        isOnSignUpPage ||
        isOnProfilePage)) ||
    isOnStudioPage ||
    isOnProfilePage ||
    isOnBetaKeyRedeemPage;
  const shouldShowSidebar = windowWidth >= 992 && !shouldNotShowSidebar;
  const sidebarClassName = `sidebar ${
    shouldShowSidebar ? "visible" : ""
  }`.trim();

  useEffect(() => {
    const contentWrapper = document.getElementById("page-content-wrapper");

    // Adjusted logic to ensure no padding is added when on the studio page
    if (shouldShowSidebar && !isOnStudioPage) {
      contentWrapper?.classList.remove("no-padding");
    } else {
      contentWrapper?.classList.add("no-padding");
    }
  }, [shouldShowSidebar, isOnStudioPage]);

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
            handleNavLinkClick();
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
            handleNavLinkClick();
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

  let maybeBetaFeatures = <></>;

  if (sessionWrapper.canAccessStudio()) {
    maybeBetaFeatures = (
      <>
        <li className="sidebar-heading">Beta Features</li>
        <li>
          <NavLink
            to="/studio-intro/m_ejhs95fc5aybp36h4a79k7523ds6an"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon icon={faFilm} className="sidebar-heading-icon" />
            Storyteller Studio
            {/* {t("videoStorytellerStudio")} */}
          </NavLink>
        </li>
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
        {
          // <li>
          //   <NavLink
          //     to="/studio"
          //     activeClassName="active-link"
          //     onClick={handleNavLinkClick}
          //   >
          //     <FontAwesomeIcon
          //       icon={faCameraMovie}
          //       className="sidebar-heading-icon"
          //     />
          //     Storyteller Studio
          //     {/* {t("videoStorytellerStudio")} */}
          //   </NavLink>
          // </li>
          // <li>
          //   <NavLink
          //     to="/engine-compositor"
          //     activeClassName="active-link"
          //     onClick={handleNavLinkClick}
          //   >
          //     <FontAwesomeIcon
          //       icon={faTransporter}
          //       className="sidebar-heading-icon"
          //     />
          //     Engine Compositor
          //     {/* {t("videoStorytellerStudio")} */}
          //   </NavLink>
          // </li>
        }
      </>
    );
  }

  let maybeImageGeneration = (
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
    </>
  );

  if (domain.website === Website.StorytellerAi) {
    return null;
  }

  return (
    <>
      <div id="sidebar-wrapper" className={sidebarClassName}>
        <div>
          <ul className="sidebar-nav">
            <li>
              <NavLink
                exact={true}
                to={domain.website === Website.FakeYou ? "/" : "/dashboard"}
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faHome}
                  className="sidebar-heading-icon"
                />
                {domain.website === Website.FakeYou ? "Home" : "Dashboard"}
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
            <li className="sidebar-heading">{t("videoTitle")}</li>

            <li>
              <NavLink
                to="/style-video"
                activeClassName="active-link"
                onClick={handleNavLinkClick}
              >
                <FontAwesomeIcon
                  icon={faFilms}
                  className="sidebar-heading-icon"
                />
                {t("videoStyleTransfer")}
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

            {maybeImageGeneration}

            {maybeBetaFeatures}

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
              <a href={GetDiscordLink()} target="_blank" rel="noreferrer">
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
            <div className="d-flex flex-column ps-4 mb-1">
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
                Image Generation:{" "}
                <span className="text-red">
                  {queueStats.inference.by_queue.pending_stable_diffusion}
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

          <div className="px-4 d-flex d-lg-none gap-2 mb-2">
            {userOrLoginButton}
            {signupOrLogOutButton}
          </div>
        </div>
      </div>
    </>
  );
}
