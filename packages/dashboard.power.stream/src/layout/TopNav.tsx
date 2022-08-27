import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TopNavSessionButton } from "./TopNavSessionButton";

interface Props {
  sessionWrapper: SessionWrapper;
  querySessionCallback: () => void;
}

function TopNav(props: Props) {
  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-dark navbar-fixed navbar-main"
        aria-label="Offcanvas navbar large"
      >
        <div className="container">
          <Link className="navbar-brand me-5 pr-8" to="/">
            <img
              src="/assets/storyteller-logo.png"
              alt="Fake You Logo"
              height="34"
            />
          </Link>
          <button
            className="navbar-toggler p-0 border-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar2"
            aria-controls="offcanvasNavbar2"
            title="toggle navbar"
          >
            <span className="sr-only">Navbar toggle</span>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-end text-white nav-bg-dark"
            id="offcanvasNavbar2"
            aria-labelledby="offcanvasNavbar2Label"
          >
            <div className="offcanvas-header">
              <a className="navbar-brand me-5 pr-8" href="index.html">
                <img src="/assets/storyteller-logo.png" alt="" height="34" />
              </a>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-start flex-grow-1 align-items-lg-center">
                {/* <li className="nav-item">
                  <a
                    className="nav-link"
                    aria-current="page"
                    href="tts-configs.html"
                  >
                    TTS Configs
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link" aria-current="page" href="#">
                    OBS Configs
                  </a>
                </li> */}
              </ul>
              <div className="d-grid gap-2 d-flex justify-content-start align-items-center pt-4 ps-3 pt-lg-0 ps-lg-0">
                <a className="nav-login me-3" href="">
                  Login
                </a>
                <button type="button" className="btn btn-primary">
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export { TopNav };
