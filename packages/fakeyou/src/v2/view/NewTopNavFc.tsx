import React, { useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link, useHistory } from "react-router-dom";
import { FrontendUrlConfig } from "../../common/FrontendUrlConfig";
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
  faMoon,
  faSun,
  faComputer,
  faLaptop,
} from "@fortawesome/free-solid-svg-icons";
import { faPatreon } from "@fortawesome/free-brands-svg-icons";
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
} from "@storyteller/fakeyou/src/data/animation";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";

interface Props {
  sessionWrapper: SessionWrapper;
  logoutHandler: () => void;
  querySessionCallback: () => void;
}

function NewTopNavFc(props: Props) {
  const defaultColourView = window.localStorage.getItem("darkMode");
  const defaultLowSpecView = window.localStorage.getItem("lowSpec");

  const [darkModes, toggleDarkModes] = useState(
    defaultColourView === "false" ? true : false
  );

  const [lowSpecView, toggleLowSpecs] = useState(
    defaultLowSpecView === "false" ? true : false
  );

  let history = useHistory();

  let myDataLink = "/signup";

  if (props.sessionWrapper.isLoggedIn()) {
    let username = props.sessionWrapper.getUsername();
    myDataLink = `/profile/${username}`;
  }

  // NB: The responses from the "job count" endpoint are cached in a distributed manner.
  // We use the timestamp as a vector clock to know when to update our view.
  const [pendingTtsJobs, setPendingTtsJobs] =
    useState<GetPendingTtsJobCountSuccessResponse>({
      success: true,
      pending_job_count: 0,
      cache_time: new Date(0), // NB: Epoch
    });

  useEffect(() => {
    const fetch = async () => {
      const response = await GetPendingTtsJobCount();
      if (GetPendingTtsJobCountIsOk(response)) {
        console.log(response);
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

  const toggleDarkMode = () => {
    window.localStorage.setItem("darkMode", darkModes ? "true" : "false");

    toggleDarkModes(!darkModes);
  };

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
    } else {
      image.hidden.opacity = 0;
      image.hidden.x = 100;
      panel.hidden.y = 50;
      item.hidden.y = 50;
      sessionItem.hidden.x = 50;
      panel.hidden.opacity = 0;
      item.hidden.opacity = 0;
      container.hidden.opacity = 0;
      sessionItem.hidden.opacity = 0;
    }
  };

  useEffect(() => {
    // Logic for dark mode toggle
    if (darkModes) document.getElementById("main")!.classList.add("dark-mode");
    else document.getElementById("main")!.classList.remove("dark-mode");

    // Logic for the animation toggle
    if (lowSpecView) document.getElementById("main")!.classList.add("low-spec");
    else document.getElementById("main")!.classList.remove("low-spec");
  });

  const logoutHandler = async () => {
    await Logout();
    props.querySessionCallback();
    history.push("/");
  };

  const loggedIn = props.sessionWrapper.isLoggedIn();

  let userOrLoginButton = (
    <>
      <Link to="/login">
        <span className="nav-login me-4" data-bs-toggle="offcanvas">
          Login
        </span>
      </Link>
    </>
  );

  let signupOrLogOutButton = (
    <>
      <Link to="/signup">
        <button className="btn btn-primary" data-bs-toggle="offcanvas">
          Sign Up
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

    let url = `/profile/${displayName}`;
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
          <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
        </button>
      </>
    );
  }

  return (
    <div>
      <div className="top-bar d-none d-lg-flex">
        <div className="container d-flex align-items-center">
          <div className="d-flex gap-4 flex-grow-1">
            <Link className="top-bar-text" to="/about">
              About
            </Link>
            <Link className="top-bar-text" to="/terms">
              Terms of Use
            </Link>
            <a
              className="top-bar-text"
              href={FrontendUrlConfig.developerDocs()}
            >
              Developers
            </a>
          </div>
          <div className="d-flex gap-3 align-items-center">
            {/* <p className="top-bar-text">
              Online Users: <span className="fw-bold text-red">1,204</span>
            </p> */}

            <Tippy
              content={`${darkModes ? "Toggle Light Mode" : "Toggle Dark Mode"
                }`}
            >
              <button
                className={`btn btn-toggle ${darkModes ? "dark" : ""}`}
                onClick={() => toggleDarkMode()}
              >
                <FontAwesomeIcon icon={darkModes ? faSun : faMoon} />
              </button>
            </Tippy>
            <Tippy
              content={`${lowSpecView ? "Turn on animations" : "Turn off animations"
                }`}
            >
              <button
                className={`btn btn-toggle  ${darkModes ? "dark" : ""}`}
                onClick={() => toggleLowSpec()}
              >
                <FontAwesomeIcon
                  icon={lowSpecView ? faComputer : faLaptop}
                  className={`${lowSpecView ? "" : ""}`}
                />
              </button>
            </Tippy>
            <p className="top-bar-text ms-2">
              TTS Queued:{" "}
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
          <Link className="navbar-brand me-5 pr-8" to="/">
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
                    to={FrontendUrlConfig.cloneRequestPage()}
                    className="nav-link "
                  >
                    <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                    Clone My Voice!
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
                    Create
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown-tts"
                  >
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/">
                        <FontAwesomeIcon icon={faVolumeUp} className="me-2" />
                        TTS
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/video">
                        <FontAwesomeIcon icon={faVideo} className="me-2" />
                        Video
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
                    Community
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown-community"
                  >
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/contribute" title="to Upload page">
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        Contribute/Upload
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/leaderboard" title="to leaderboard">
                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                        Leaderboard
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/patrons" title="to patron list">
                        <FontAwesomeIcon icon={faPatreon} className="me-2" />
                        Patrons
                      </Link>
                    </li>
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to="/firehose" title="to feed">
                        <FontAwesomeIcon icon={faList} className="me-2" />
                        Feed
                      </Link>
                    </li>
                    <hr className='dropdown-divider' />
                    <li data-bs-toggle="offcanvas">
                      <Link className="dropdown-item" to={myDataLink} title="my profile">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        My Data
                      </Link>
                    </li>
                  </ul>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item d-lg-none">
                  <Link className="nav-link" aria-current="page" to="/about" title="About Us">
                    About
                  </Link>
                </li>

                <li data-bs-toggle="offcanvas" className="nav-item d-lg-none">
                  <Link className="nav-link" aria-current="page" title="Terms of Use" to="/terms">
                    Terms of Use
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
                    Developers
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
                      TTS Queued:{" "}
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
                    <div className="top-bar-text mobile">Options:</div>
                    <Tippy
                      content={`${darkModes ? "Toggle Light Mode" : "Toggle Dark Mode"
                        }`}
                    >
                      <button
                        className={`btn btn-toggle ${darkModes ? "dark" : ""}`}
                        onClick={() => toggleDarkMode()}
                      >
                        <FontAwesomeIcon icon={darkModes ? faSun : faMoon} />
                      </button>
                    </Tippy>
                    <Tippy
                      content={`${lowSpecView
                        ? "Turn on animations"
                        : "Turn off animations"
                        }`}
                    >
                      <button
                        className={`btn btn-toggle  ${darkModes ? "dark" : ""}`}
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

export { NewTopNavFc };
