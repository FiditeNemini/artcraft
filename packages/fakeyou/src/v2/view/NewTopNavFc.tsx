import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";
import { MigrationTopNavSession } from "../../migration/MigrationTopNav_Session";
import { FrontendUrlConfig } from "../../common/FrontendUrlConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGavel,
  faGrinBeamSweat,
  faList,
  faTrophy,
  faUpload,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faPatreon } from "@fortawesome/free-brands-svg-icons";
import { t } from "i18next";

interface Props {
  sessionWrapper: SessionWrapper;
  logoutHandler: () => void;
  querySessionCallback: () => void;
}

function NewTopNavFc(props: Props) {
  let myDataLink = "/signup";

  if (props.sessionWrapper.isLoggedIn()) {
    let username = props.sessionWrapper.getUsername();
    myDataLink = `/profile/${username}`;
  }

  const [mobileHamburgerIsActive, setMobileHamburgerIsActive] =
    useState<boolean>(false);

  const toggleHamburger = () => {
    setMobileHamburgerIsActive(!mobileHamburgerIsActive);
  };

  const closeHamburger = () => {
    // TODO: This is an ergonomic hack.
    // The hamburger ideally should close whenever it is no longer active.
    setMobileHamburgerIsActive(false);
  };

  const navbarClasses = mobileHamburgerIsActive
    ? "navbar-menu is-active"
    : "navbar-menu";
  const navbarBurgerClasses = mobileHamburgerIsActive
    ? "navbar-burger is-active"
    : "navbar-burger";

  return (
    <>
      <div className="top-bar d-none d-lg-flex">
        <div className="container d-flex">
          <div className="d-flex gap-4 flex-grow-1">
            <a className="top-bar-text" href="about.html">
              About
            </a>
            <a className="top-bar-text" href="terms.html">
              Terms of Use
            </a>
            <a className="top-bar-text" href="#">
              Developers
            </a>
            <a
              className="top-bar-text d-flex align-items-center dropdown-toggle"
              href="#"
              id="offcanvasNavbarLgDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img className="me-2" src="assets/eng-flag.png" height="12" />
              ENG
            </a>
          </div>
          <div className="d-flex gap-4">
            <p className="top-bar-text">
              Online: <span className="fw-bold text-red">1,204</span>
            </p>
            <p className="top-bar-text">
              Queued: <span className="fw-bold text-red">48</span>
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
              src="fakeyou/FakeYou-Logo.png"
              alt="FakeYou: Cartoon and Celebrity Text to Speech"
              height="34"
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
              <a className="navbar-brand me-5 pr-8" href="#">
                <img src="assets/FakeYou-Logo-Left.png" alt="" height="34" />
              </a>

              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-start align-items-lg-center flex-grow-1 pe-3">
                <li className="nav-item">
                  <Link
                    to={FrontendUrlConfig.cloneRequestPage()}
                    className="nav-link"
                  >
                    Clone My Voice!
                  </Link>
                </li>

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="offcanvasNavbarLgDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fa-solid fa-plus me-2"></i>Create
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown"
                  >
                    <li>
                      <a className="dropdown-item" href="index.html">
                        <i className="fa-solid fa-volume-high me-2"></i>TTS
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="video.html">
                        <i className="fa-solid fa-video me-2"></i>Video
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="offcanvasNavbarLgDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <i className="fa-solid fa-users me-2"></i>Community
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown"
                  >
                    <li>
                      <a className="dropdown-item" href="contribute.html">
                        <i className="fa-solid fa-upload me-2"></i>
                        Contribute/Upload
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="leaderboard.html">
                        <i className="fa-solid fa-trophy me-2"></i>Leaderboard
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="patrons.html">
                        <i className="fa-brands fa-patreon me-2"></i>Patrons
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="firehose.html">
                        <i className="fa-solid fa-list me-2"></i>Feed
                      </a>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <a className="dropdown-item" href="profile.html">
                        <i className="fa-solid fa-user me-2"></i>My Data
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="nav-item d-lg-none">
                  <a className="nav-link" aria-current="page" href="about.html">
                    About
                  </a>
                </li>

                <li className="nav-item d-lg-none">
                  <a className="nav-link" aria-current="page" href="terms.html">
                    Terms of Use
                  </a>
                </li>

                <li className="nav-item d-lg-none">
                  <a className="nav-link" aria-current="page" href="#">
                    Developers
                  </a>
                </li>
                <li className="d-lg-none">
                  <div className="dropdown-divider dropdown-divider-white mt-3"></div>
                </li>

                <li className="nav-item dropdown d-lg-none">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="offcanvasNavbarLgDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <img
                      className="me-2"
                      src="assets/eng-flag.png"
                      height="12"
                    />
                    English
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown"
                  >
                    <li>
                      <a className="dropdown-item" href="">
                        <img
                          className="me-2"
                          src="assets/eng-flag.png"
                          height="12"
                        />
                        English
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="">
                        <img
                          className="me-2"
                          src="assets/esp-flag.png"
                          height="12"
                        />
                        Spanish
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="d-lg-none">
                  <div className="dropdown-divider dropdown-divider-white"></div>
                </li>

                <li className="ps-3 d-lg-none">
                  <div className="d-flex gap-4 py-2">
                    <p className="top-bar-text">
                      Online: <span className="fw-bold text-red">1,204</span>
                    </p>
                    <p className="top-bar-text">
                      Queued: <span className="fw-bold text-red">48</span>
                    </p>
                  </div>
                </li>

                <li className="d-lg-none">
                  <div className="dropdown-divider dropdown-divider-white"></div>
                </li>
              </ul>
              <div className="d-grid gap-2 d-flex justify-content-start align-items-center pt-4 ps-3 pt-lg-0 ps-lg-0">
                <a className="nav-login me-3" href="">
                  Login
                </a>
                <button type="button" className="btn btn-primary btn-lg">
                  Sign up
                </button>
              </div>
              {/* <div className="navbar-end">
                <div className="navbar-item">
                  <div className="field is-grouped">
                    <p className="control">
                      <MigrationTopNavSession
                        sessionWrapper={props.sessionWrapper}
                        enableAlpha={true}
                        querySessionAction={props.querySessionCallback}
                        closeHamburgerAction={() => closeHamburger()}
                      />
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export { NewTopNavFc };
