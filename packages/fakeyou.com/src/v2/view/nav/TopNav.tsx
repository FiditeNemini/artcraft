import React, { useEffect, useState } from "react";
import { t } from "i18next";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link, useHistory } from "react-router-dom";
import { FrontendUrlConfig } from "../../../common/FrontendUrlConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faVolumeUp,
  faPlus,
  faUsers,
  faVideo,
  faList,
  faTrophy,
  faUpload,
  faUser,
  faSignOutAlt,
  faComputer,
  faLaptop,
  faBook,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faPatreon } from "@fortawesome/free-brands-svg-icons";
import { Logout } from "@storyteller/components/src/api/session/Logout";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import {
  GetPendingTtsJobCount,
  GetPendingTtsJobCountIsOk,
  GetPendingTtsJobCountSuccessResponse,
} from "@storyteller/components/src/api/tts/GetPendingTtsJobCount";
import {
  container,
  item,
  panel,
  image,
  sessionItem,
} from "../../../data/animation";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";
import { Analytics } from "../../../common/Analytics";

interface Props {
  sessionWrapper: SessionWrapper;
  logoutHandler: () => void;
  querySessionCallback: () => void;
  querySessionSubscriptionsCallback: () => void;
}

function TopNav(props: Props) {
  // const defaultColourView = window.localStorage.getItem("darkMode");
  const defaultLowSpecView = window.localStorage.getItem("lowSpec");

  // const [darkModes, toggleDarkModes] = useState(
  //   defaultColourView === "false" ? true : false
  // );

  const [lowSpecView, toggleLowSpecs] = useState(
    defaultLowSpecView === "false" ? true : false
  );

  let history = useHistory();

  let myDataLink = FrontendUrlConfig.signupPage();

  if (props.sessionWrapper.isLoggedIn()) {
    let username = props.sessionWrapper.getUsername() as string; // NB: Should be present if logged in
    myDataLink = FrontendUrlConfig.userProfilePage(username);
  }

  // NB: The responses from the "job count" endpoint are cached in a distributed manner.
  // We use the timestamp as a vector clock to know when to update our view.
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

  // const toggleDarkMode = () => {
  //   window.localStorage.setItem("darkMode", darkModes ? "true" : "false");

  //   toggleDarkModes(!darkModes);
  // };

  const toggleLowSpec = () => {
    window.localStorage.setItem("lowSpec", lowSpecView ? "true" : "false");

    toggleLowSpecs(!lowSpecView);

    if (lowSpecView === false) {
      image.hidden.opacity = 1;
      image.hidden.x = 0;
      panel.hidden.y = 0;
      item.hidden.y = 0;
      sessionItem.hidden.x = 0;
      panel.hidden.opacity = 1;
      item.hidden.opacity = 1;
      container.hidden.opacity = 1;
      sessionItem.hidden.opacity = 1;
      Analytics.uiTurnOnAnimations();
    } else {
      image.hidden.opacity = 0;
      image.hidden.x = 15;
      panel.hidden.y = 15;
      item.hidden.y = 15;
      sessionItem.hidden.x = 15;
      panel.hidden.opacity = 0;
      item.hidden.opacity = 0;
      container.hidden.opacity = 0;
      sessionItem.hidden.opacity = 0;
      Analytics.uiTurnOffAnimations();
    }
  };

  useEffect(() => {
    // Logic for dark mode toggle
    // if (darkModes) document.getElementById("main")!.classList.add("dark-mode");
    // else document.getElementById("main")!.classList.remove("dark-mode");

    // Logic for the animation toggle
    if (lowSpecView) document.getElementById("main")!.classList.add("low-spec");
    else document.getElementById("main")!.classList.remove("low-spec");
  });

  const logoutHandler = async () => {
    await Logout();
    props.querySessionCallback();
    props.querySessionSubscriptionsCallback();
    Analytics.accountLogout();
    history.push("/");
  };

  const loggedIn = props.sessionWrapper.isLoggedIn();

  let userOrLoginButton = (
    <>
      <Link to={FrontendUrlConfig.loginPage()}>
        <span className="nav-login me-4" data-bs-toggle="offcanvas">
          {t("nav.TopNav.buttons.login")}
        </span>
      </Link>
    </>
  );

  let signupOrLogOutButton = (
    <>
      <Link to={FrontendUrlConfig.signupPage()}>
        <button className="btn btn-primary" data-bs-toggle="offcanvas">
          {t("nav.TopNav.buttons.signUp")}
        </button>
      </Link>
    </>
  );

  if (loggedIn) {
    let displayName = props.sessionWrapper.getDisplayName();
    let gravatarHash = props.sessionWrapper.getEmailGravatarHash();
    let gravatar = <span />;

    if (displayName === undefined) {
      displayName = "My Account";
    }

    if (gravatarHash !== undefined) {
      gravatar = <Gravatar email_hash={gravatarHash} size={15} />;
    }

    let url = FrontendUrlConfig.userProfilePage(displayName);
    userOrLoginButton = (
      <>
        <Link className="btn btn-secondary me-3" to={url}>
          <span data-bs-toggle="offcanvas">
            {gravatar}&nbsp; {displayName}
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
          <FontAwesomeIcon icon={faSignOutAlt} />
          {" "}
          {t("nav.TopNav.buttons.logout")}
        </button>
      </>
    );
  }

  return (
    <div>
      <div className="top-bar d-none d-lg-flex">
        <div className="container d-flex align-items-center">
          <div className="d-flex gap-4 flex-grow-1">
            <Link className="top-bar-text" to="/about" onClick={() => { Analytics.topbarClickAbout() } }>
              {t("nav.TopNav.topbar.aboutLink")}
            </Link>
            <Link className="top-bar-text" to="/terms" onClick={() => { Analytics.topbarClickTerms() } }>
              {t("nav.TopNav.topbar.termsLink")}
            </Link>
            <Link className="top-bar-text" to="/privacy">
              {t("nav.TopNav.topbar.privacyLink")}
            </Link>
            <a
              className="top-bar-text"
              href={FrontendUrlConfig.developerDocs()}
            >
              {t("nav.TopNav.topbar.developersLink")}
            </a>
          </div>
          <div className="d-flex gap-3 align-items-center">
            {/* <p className="top-bar-text">
              Online Users: <span className="fw-bold text-red">1,204</span>
            </p> */}

            {/* <Tippy
              content={`${
                darkModes ? "Toggle Light Mode" : "Toggle Dark Mode"
              }`}
            >
              <button
                className={`btn btn-toggle ${darkModes ? "dark" : ""}`}
                onClick={() => toggleDarkMode()}
              >
                <FontAwesomeIcon icon={darkModes ? faSun : faMoon} />
              </button>
            </Tippy> */}
            <Tippy
              content={`${
                lowSpecView ? "Turn on animations" : "Turn off animations"
              }`}
            >
              <button
                className="btn btn-toggle"
                onClick={() => toggleLowSpec()}
              >
                <FontAwesomeIcon
                  icon={lowSpecView ? faComputer : faLaptop}
                  className={`${lowSpecView ? "" : ""}`}
                />
              </button>
            </Tippy>
            <p className="top-bar-text ms-2">
              {t("nav.TopNav.topbar.ttsQueued")}:
              {" "}
              <span className="fw-bold text-red">
                {pendingTtsJobs.pending_job_count}
              </span>
            </p>
          </div>
        </div>
      </div>

      <nav
        className="navbar navbar-expand-lg navbar-dark py-3"
        aria-label="Offcanvas navbar large"
      >
        <div className="container">
          <Link className="navbar-brand me-3 pr-8" to="/">
            <img
              src="/fakeyou/FakeYou-Logo.png"
              alt="FakeYou: Cartoon and Celebrity Text to Speech"
              height="38"
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
                className="navbar-brand me-5 pr-8"
                to="/"
              >
                <img
                  src="/fakeyou/FakeYou-Logo.png"
                  alt="FakeYou: Cartoon and Celebrity Text to Speech"
                  height="38"
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
                <li data-bs-toggle="offcanvas" className="nav-item">
                  <Link
                    to={FrontendUrlConfig.pricingPageWithReferer("topnav")}
                    onClick={() => { Analytics.topbarClickPricing() } }
                    className="nav-link"
                  >
                    <FontAwesomeIcon icon={faStar} className="me-2" />
                    {t("nav.TopNav.main.pricingLink")}
                  </Link>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item">
                  <Link
                    to={FrontendUrlConfig.cloneRequestPage()}
                    onClick={() => { Analytics.topbarClickVoiceClone() } }
                    className="nav-link"
                  >
                    <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                    {t("nav.TopNav.main.voiceCloneLink")}
                  </Link>
                </li>

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
                    {t("nav.TopNav.main.createDropdown")}
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown-tts"
                  >
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/">
                        <FontAwesomeIcon icon={faVolumeUp} className="me-2" />
                        {t("nav.TopNav.main.ttsOption")}
                      </Link>
                    </li>
                    {/* TODO(bt, 2023-01-11): Not ready to launch voice conversion
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/voice-conversion">
                        <FontAwesomeIcon
                          icon={faMicrophoneLines}
                          className="me-2"
                        />
                        {"  "}
                        Voice Conversion
                      </Link>
                    </li>
                    */}
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/video">
                        <FontAwesomeIcon icon={faVideo} className="me-2" />
                        {t("nav.TopNav.main.videoOption")}
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
                    {t("nav.TopNav.main.communityDropdown")}
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown-community"
                  >
                    <li data-bs-toggle="offcanvas">
                      <Link
                        className="dropdown-item"
                        to="/contribute"
                        title="to Upload page"
                      >
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        {t("nav.TopNav.main.contributeOption")}
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link
                        className="dropdown-item"
                        to="/leaderboard"
                        title="to leaderboard"
                      >
                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                        {t("nav.TopNav.main.leaderboardOption")}
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <a
                        className="dropdown-item"
                        href={ThirdPartyLinks.FAKEYOU_DISCORD}
                        title="discord chat"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faDiscord} className="me-2" />
                        {t("nav.TopNav.main.discordOption")}
                      </a>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link
                        className="dropdown-item"
                        to="/patrons"
                        title="to patron list"
                      >
                        <FontAwesomeIcon icon={faPatreon} className="me-2" />
                        {t("nav.TopNav.main.patronsOption")}
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link
                        className="dropdown-item"
                        to="/guide"
                        title="to guide"
                      >
                        <FontAwesomeIcon icon={faBook} className="me-2" />
                        {t("nav.TopNav.main.guideOption")}
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link
                        className="dropdown-item"
                        to="/firehose"
                        title="to feed"
                      >
                        <FontAwesomeIcon icon={faList} className="me-2" />
                        {t("nav.TopNav.main.feedOption")}
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
                        {t("nav.TopNav.main.myDataOption")}
                      </Link>
                    </li>
                  </ul>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item d-lg-none">
                  <Link
                    className="nav-link"
                    aria-current="page"
                    to="/about"
                    title="About Us"
                  >
                    {t("nav.TopNav.topbar.aboutLink")}
                  </Link>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item d-lg-none">
                  <Link
                    className="nav-link"
                    aria-current="page"
                    title="Terms of Use"
                    to="/terms"
                  >
                    {t("nav.TopNav.topbar.termsLink")}
                  </Link>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item d-lg-none">
                  <Link
                    className="nav-link"
                    aria-current="page"
                    title="Privacy Policy"
                    to="/privacy"
                  >
                    {t("nav.TopNav.topbar.privacyLink")}
                  </Link>
                </li>

                <li className="nav-item d-lg-none">
                  {/* TODO(echelon): Fix the build warnings about href not being accessible. */}
                  <a
                    className="nav-link"
                    aria-current="page"
                    title="to API"
                    href={FrontendUrlConfig.developerDocs()}
                  >
                    {t("nav.TopNav.topbar.developersLink")}
                  </a>
                </li>
                <li className="d-lg-none">
                  <hr className="dropdown-divider dropdown-divider-white" />
                </li>

                <li className="ps-3 d-lg-none">
                  <div className="d-flex gap-4 py-2">
                    {/* <p className="top-bar-text">
                      Online: <span className="fw-bold text-red">1,204</span>
                    </p> */}
                    <div className="top-bar-text mobile">
                      {t("nav.TopNav.topbar.ttsQueued")}:
                      {" "}
                      <span className="fw-bold text-red ">
                        {pendingTtsJobs.pending_job_count}
                      </span>
                    </div>
                  </div>
                </li>

                <li className="d-lg-none">
                  <hr className="dropdown-divider dropdown-divider-white" />
                </li>

                <li className="ps-3 d-lg-none">
                  <div className="d-flex gap-4 py-2">
                    <div className="top-bar-text mobile">
                      {t("nav.TopNav.topbar.options")}:
                    </div>
                    {/* <Tippy
                      content={`${
                        darkModes ? "Toggle Light Mode" : "Toggle Dark Mode"
                      }`}
                    >
                      <button
                        className={`btn btn-toggle ${darkModes ? "dark" : ""}`}
                        onClick={() => toggleDarkMode()}
                      >
                        <FontAwesomeIcon icon={darkModes ? faSun : faMoon} />
                      </button>
                    </Tippy> */}
                    <Tippy
                      content={`${
                        lowSpecView
                          ? "Turn on animations"
                          : "Turn off animations"
                      }`}
                    >
                      <button
                        className="btn btn-toggle"
                        onClick={() => toggleLowSpec()}
                      >
                        <FontAwesomeIcon
                          icon={lowSpecView ? faComputer : faLaptop}
                          className={`${lowSpecView ? "" : ""}`}
                        />
                      </button>
                    </Tippy>
                  </div>
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
