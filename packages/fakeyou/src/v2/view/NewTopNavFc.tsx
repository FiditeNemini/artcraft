import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";
import { MigrationTopNavSession } from "../../migration/MigrationTopNav_Session";
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

  // const [mobileHamburgerIsActive, setMobileHamburgerIsActive] =
  //   useState<boolean>(false);

  // const toggleHamburger = () => {
  //   setMobileHamburgerIsActive(!mobileHamburgerIsActive);
  // };

  // const closeHamburger = () => {
  //   // TODO: This is an ergonomic hack.
  //   // The hamburger ideally should close whenever it is no longer active.
  //   setMobileHamburgerIsActive(false);
  // };

  // const navbarClasses = mobileHamburgerIsActive
  //   ? "navbar-menu is-active"
  //   : "navbar-menu";
  // const navbarBurgerClasses = mobileHamburgerIsActive
  //   ? "navbar-burger is-active"
  //   : "navbar-burger";

  return (
    <>
      <div className="top-bar d-none d-lg-flex">
        <div className="container d-flex">
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
              <Link className="navbar-brand me-5 pr-8" to="/">
                <img
                  src="fakeyou/FakeYou-Logo.png"
                  alt="FakeYou: Cartoon and Celebrity Text to Speech"
                  height="34"
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
                <li className="nav-item">
                  <Link
                    to={FrontendUrlConfig.cloneRequestPage()}
                    className="nav-link"
                  >
                    <FontAwesomeIcon icon={faMicrophone} className="me-2" />
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
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Create
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown"
                  >
                    <li>
                      <Link className="dropdown-item" to="/">
                        <FontAwesomeIcon icon={faVolumeUp} className="me-2" />
                        TTS
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/video">
                        <FontAwesomeIcon icon={faVideo} className="me-2" />
                        Video
                      </Link>
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
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Community
                  </a>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="offcanvasNavbarLgDropdown"
                  >
                    <li>
                      <Link className="dropdown-item" to="/contribute">
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        Contribute/Upload
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/leaderboard">
                        <FontAwesomeIcon icon={faTrophy} className="me-2" />
                        Leaderboard
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/patrons">
                        <FontAwesomeIcon icon={faPatreon} className="me-2" />
                        Patrons
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/firehose">
                        <FontAwesomeIcon icon={faList} className="me-2" />
                        Feed
                      </Link>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        My Data
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item d-lg-none">
                  <Link className="nav-link" aria-current="page" to="/about">
                    About
                  </Link>
                </li>

                <li className="nav-item d-lg-none">
                  <Link className="nav-link" aria-current="page" to="/terms">
                    Terms of Use
                  </Link>
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
                <Link className="nav-login me-3" to="/login">
                  Login
                </Link>
                <Link to="/signup">
                  <button type="button" className="btn btn-primary btn-lg">
                    Sign up
                  </button>
                </Link>
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
