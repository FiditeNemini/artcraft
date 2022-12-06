import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TopNavSessionButton } from "./TopNavSessionButton";

interface Props {
  sessionWrapper: SessionWrapper;
  querySessionCallback: () => void;
}

function TopNav(props: Props) {
  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY > 50);
    });
  }, []);

  return (
    <>
      <nav
        className={
          scroll
            ? "navbar navbar-expand-lg navbar-dark navbar-fixed navbar-scrolled"
            : "navbar navbar-expand-lg navbar-dark navbar-fixed"
        }
        aria-label="Offcanvas navbar large"
      >
        <div className="container">
          <Link className="navbar-brand me-5 pr-8" to="/">
            <img
              src="/assets/powerstream-logo.png"
              alt="Fake You Logo"
              height="32"
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
            id="offcanvasNavbar2"
            aria-labelledby="offcanvasNavbar2Label"
          >
            <div className="offcanvas-header">
              <Link className="navbar-brand me-5 pr-8" to="/">
                <img src="/assets/storyteller-logo.png" alt="" height="32" />
              </Link>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-start flex-grow-1 align-items-lg-center">
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    aria-current="page"
                    to="/tts_configs"
                  >
                    TTS Configs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    aria-current="page"
                    to="/obs_configs"
                  >
                    OBS Configs
                  </Link>
                </li>
              </ul>
              {/* <div className="d-grid gap-2 d-flex justify-content-start align-items-center pt-4 ps-3 pt-lg-0 ps-lg-0">
                <Link className="nav-login me-3" to="/login">
                  Login
                </Link>
                <button type="button" className="btn btn-primary">
                  Sign up
                </button>
              </div> */}
              <div>
                <TopNavSessionButton
                  sessionWrapper={props.sessionWrapper}
                  enableAlpha={true}
                  querySessionAction={props.querySessionCallback}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export { TopNav };
