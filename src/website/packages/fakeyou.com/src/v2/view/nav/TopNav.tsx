import React, { useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { Link, useHistory } from "react-router-dom";
import { WebUrl } from "../../../common/WebUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUsers,
  faTrophy,
  faUser,
  faSignOutAlt,
  faBook,
  faStar,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { Logout } from "@storyteller/components/src/api/session/Logout";
// import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import {
  GetPendingTtsJobCount,
  GetPendingTtsJobCountIsOk,
  GetPendingTtsJobCountSuccessResponse,
} from "@storyteller/components/src/api/tts/GetPendingTtsJobCount";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";
import { Analytics } from "../../../common/Analytics";
import {
  faFaceViewfinder,
  faFileArrowUp,
  faMessageDots,
  faMicrophoneStand,
} from "@fortawesome/pro-solid-svg-icons";
import { useLocalize } from "hooks";

// TODO: This is duplicated in SessionTtsInferenceResultsList !
// Default to querying every 15 seconds, but make it configurable serverside
const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

interface Props {
  sessionWrapper: SessionWrapper;
  logoutHandler: () => void;
  querySessionCallback: () => void;
  querySessionSubscriptionsCallback: () => void;
}

function TopNav(props: Props) {
  const { t } = useLocalize("TopNav");
  let history = useHistory();
  let myDataLink = WebUrl.signupPage();

  if (props.sessionWrapper.isLoggedIn()) {
    let username = props.sessionWrapper.getUsername() as string; // NB: Should be present if logged in
    myDataLink = WebUrl.userProfilePage(username);
  }

  // NB: The responses from the "job count" endpoint are cached in a distributed manner.
  // We use the timestamp as a vector clock to know when to update our view.
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

  const logoutHandler = async () => {
    await Logout();
    props.querySessionCallback();
    props.querySessionSubscriptionsCallback();
    PosthogClient.reset();
    Analytics.accountLogout();
    history.push("/");
  };

  const loggedIn = props.sessionWrapper.isLoggedIn();

  let userOrLoginButton = (
    <>
      <Link to={WebUrl.loginPage()}>
        <span className="nav-login me-4" data-bs-toggle="offcanvas">
          {t("buttonLogin")}
        </span>
      </Link>
    </>
  );

  let signupOrLogOutButton = (
    <>
      <Link to={WebUrl.signupPage()}>
        <button className="btn btn-primary" data-bs-toggle="offcanvas">
          {t("buttonSignUp")}
        </button>
      </Link>
    </>
  );

  if (loggedIn) {
    let displayName = props.sessionWrapper.getDisplayName();
    // let gravatarHash = props.sessionWrapper.getEmailGravatarHash();
    // let gravatar = <span />;

    if (displayName === undefined) {
      displayName = "My Account";
    }

    // if (gravatarHash !== undefined) {
    //   gravatar = <Gravatar email_hash={gravatarHash} size={15} />;
    // }

    let url = WebUrl.userProfilePage(displayName);
    userOrLoginButton = (
      <>
        <Link className="btn btn-secondary me-3" to={url}>
          <span data-bs-toggle="offcanvas">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            {displayName}
          </span>
        </Link>
      </>
    );

    signupOrLogOutButton = (
      <>
        <button
          type="button"
          className="btn btn-destructive d-flex gap-2 align-items-center"
          onClick={async () => {
            await logoutHandler();
          }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> {t("buttonLogOut")}
        </button>
      </>
    );
  }

  return (
    <div className="d-none d-lg-block overflow-hidden vw-100">
      <nav
        className="navbar navbar-expand-lg navbar-dark pt-3"
        aria-label="Offcanvas navbar large"
      >
        <div className="container">
          <Link className="navbar-brand me-4" to="/">
            <img
              src="/fakeyou/FakeYou-Logo.png"
              alt="FakeYou: Cartoon and Celebrity Text to Speech"
              height="36"
            />
          </Link>
          <button
            className="navbar-toggler p-0 border-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar2"
            aria-controls="offcanvasNavbar2"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-end text-white nav-bg-dark"
            // tabindex="-1"
            id="offcanvasNavbar2"
            aria-labelledby="offcanvasNavbar2Label"
          >
            <div className="offcanvas-header">
              <Link
                data-bs-toggle="offcanvas"
                className="navbar-brand me-5"
                to="/"
              >
                <img
                  src="/fakeyou/FakeYou-Logo.png"
                  alt="FakeYou: Cartoon and Celebrity Text to Speech"
                  height="36"
                />
              </Link>

              <button
                type="button"
                className="btn-close btn-close-white me-0"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-start align-items-lg-center flex-grow-1 gap-2 gap-lg-0">
                <li className="nav-item dropdown">
                  {/* TODO(echelon): Fix the build warnings about href not being accessible. */}
                  <a
                    className="nav-link dropdown-toggle"
                    href="/"
                    id="offcanvasNavbarLgDropdown-tts"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    {t("productsTitle")}
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown-tts"
                  >
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/tts">
                        <FontAwesomeIcon
                          icon={faMessageDots}
                          className="me-2"
                        />
                        {t("productTts")}
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/voice-conversion">
                        <FontAwesomeIcon
                          icon={faMicrophoneStand}
                          className="me-2"
                        />
                        {t("productVc")}
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/voice-designer">
                        <FontAwesomeIcon
                          icon={faWandMagicSparkles}
                          className="me-2"
                        />
                        Voice Designer
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/face-animator">
                        <FontAwesomeIcon
                          icon={faFaceViewfinder}
                          className="me-2"
                        />
                        {t("productFaceAnimator")}
                      </Link>
                    </li>
                    <hr className="my-2" />
                    <li data-bs-toggle="offcanvas">
                      <Link
                        className="dropdown-item"
                        to="/contribute"
                        title="to Upload page"
                      >
                        <FontAwesomeIcon
                          icon={faFileArrowUp}
                          className="me-2"
                        />
                        {t("productUploadModels")}
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item dropdown">
                  {/* TODO(echelon): Fix the build warnings about href not being accessible. */}
                  <a
                    className="nav-link dropdown-toggle"
                    href="/"
                    id="offcanvasNavbarLgDropdown-community"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-label="Community dropdown"
                  >
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    {t("communityTitle")}
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown-community"
                  >
                    <li data-bs-toggle="offcanvas">
                      <a
                        className="dropdown-item"
                        href={ThirdPartyLinks.FAKEYOU_DISCORD}
                        title="discord chat"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faDiscord} className="me-2" />
                        {t("communityDiscord")}
                      </a>
                    </li>

                    <li data-bs-toggle="offcanvas">
                      <Link
                        className="dropdown-item"
                        to="/leaderboard"
                        title="to leaderboard"
                      >
                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                        {t("communityLeaderboard")}
                      </Link>
                    </li>

                    <li data-bs-toggle="offcanvas">
                      <Link
                        className="dropdown-item"
                        to="/guide"
                        title="to guide"
                      >
                        <FontAwesomeIcon icon={faBook} className="me-2" />
                        {t("communityGuide")}
                      </Link>
                    </li>

                    <hr className="dropdown-divider" />
                    <li data-bs-toggle="offcanvas">
                      <Link
                        className="dropdown-item"
                        to={myDataLink}
                        title="my profile"
                      >
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        {t("communityProfile")}
                      </Link>
                    </li>
                  </ul>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item">
                  <Link
                    to={WebUrl.pricingPageWithReferer("topnav")}
                    onClick={() => {
                      Analytics.topbarClickPricing();
                    }}
                    className="nav-link"
                  >
                    <FontAwesomeIcon icon={faStar} className="me-2" />
                    {t("pricingTitle")}
                  </Link>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item d-lg-none">
                  <Link
                    className="nav-link"
                    aria-current="page"
                    to="/about"
                    title="About Us"
                  >
                    {t("infoAbout")}
                  </Link>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item d-lg-none">
                  <Link
                    className="nav-link"
                    aria-current="page"
                    title="Terms of Use"
                    to="/terms"
                  >
                    {t("infoTerms")}
                  </Link>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item d-lg-none">
                  <Link
                    className="nav-link"
                    aria-current="page"
                    title="Privacy Policy"
                    to="/privacy"
                  >
                    {t("infoPrivacyPolicy")}
                  </Link>
                </li>

                <li className="nav-item d-lg-none">
                  {/* TODO(echelon): Fix the build warnings about href not being accessible. */}
                  <a
                    className="nav-link"
                    aria-current="page"
                    title="to API"
                    href={WebUrl.developerDocs()}
                  >
                    {t("infoApiDocs")}
                  </a>
                </li>

                <li className="d-lg-none">
                  <hr className="dropdown-divider dropdown-divider-white" />
                </li>
              </ul>
              <div className="d-grid d-flex justify-content-start align-items-center pt-4 ps-3 pt-lg-0 ps-lg-0">
                {userOrLoginButton}
                {signupOrLogOutButton}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export { TopNav };
