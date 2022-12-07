import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
          <a className="navbar-brand me-5 pr-8" href="#">
            <img
              src="/assets/powerstream-logo.png"
              alt="PowerStream Logo"
              height="32"
            />
          </a>
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
            <div className="offcanvas-header" data-bs-toggle="offcanvas">
              <a className="navbar-brand me-5 pr-8" href="#">
                <img
                  src="/assets/powerstream-logo.png"
                  alt="PowerStream Logo"
                  height="32"
                />
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
                <li className="nav-item">
                  <a className="nav-link" href="#features">
                    Features
                  </a>
                </li>
                <li className="nav-item" data-bs-toggle="offcanvas">
                  <a className="nav-link" href="#voices">
                    Voice Previews
                  </a>
                </li>
                <li className="nav-item" data-bs-toggle="offcanvas">
                  <a className="nav-link" href="#insights">
                    Insights
                  </a>
                </li>
                <li className="nav-item" data-bs-toggle="offcanvas">
                  <a className="nav-link" href="#faq">
                    FAQ
                  </a>
                </li>
                <li className="nav-item" data-bs-toggle="offcanvas">
                  <a className="nav-link" href="#community">
                    Community
                  </a>
                </li>
              </ul>
              <hr className="my-4" />
              <div className="d-grid gap-2 d-flex justify-content-start align-items-center ps-3 pt-lg-0 ps-lg-0">
                <a
                  className="nav-login me-3"
                  href="https://dash.power.stream/login"
                >
                  Login
                </a>
                <a
                  href="https://dash.power.stream/signup"
                  className="btn btn-primary"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export { TopNav };
