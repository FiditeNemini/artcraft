import React, { useState, useEffect } from "react";
import {
  faApple,
  faDiscord,
  faFacebook,
  faPatreon,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Marquee from "react-fast-marquee";

import { Link } from "react-router-dom";

function IndexPage() {
  return (
    <>
      <div id="home" data-scroll-section>
        <div className="bg-hero">
          <div
            className="shape-1-container"
            data-scroll
            data-scroll-speed="4"
            data-scroll-position="top"
          >
            <div className="shape-1"></div>
          </div>
          <div className="shape-2"></div>
          <div
            className="shape-3-container"
            data-scroll
            data-scroll-speed="3"
            data-scroll-position="top"
          >
            <div className="shape-3"></div>
          </div>
          <div
            className="shape-4-container"
            data-scroll
            data-scroll-speed="2"
            data-scroll-position="top"
          >
            <div className="shape-4"></div>
          </div>
          <div className="container">
            <div className="hero-title-container">
              <h1 className="hero-title d-flex flex-column text-center">
                <div
                  className="hero-title-one align-items-center zi-2"
                  data-scroll
                  data-scroll-speed="3"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  The <span>Future</span>
                </div>
                <div
                  className="hero-title-two zi-2"
                  data-scroll
                  data-scroll-speed="-3"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  of Production
                </div>
              </h1>

              <div className="d-flex flex-column align-items-end">
                <p
                  className="lead text-end w-50 hero-sub-title"
                  data-scroll
                  data-scroll-speed="-4"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  We’re streamers and filmmakers building the components of the
                  future Hollywood studio.
                </p>
                <div
                  data-scroll
                  data-scroll-speed="-5"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                  className="zi-10 mt-2"
                >
                  <a className="btn btn-primary" href="#about" data-scroll-to>
                    <span>Explore</span>
                  </a>
                </div>
              </div>

              <div className="hero-title-outline noselect">
                <h1 className="hero-title d-flex flex-column text-center">
                  <div
                    className="hero-title-one align-items-center text-outline"
                    data-scroll
                    data-scroll-speed="-4"
                    data-scroll-direction="horizontal"
                    data-scroll-position="top"
                  >
                    The Future
                  </div>
                  <div
                    className="hero-title-two text-outline"
                    data-scroll
                    data-scroll-speed="4"
                    data-scroll-direction="horizontal"
                    data-scroll-position="top"
                  >
                    of Production
                  </div>
                </h1>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <img
              className="hero-img"
              src="/hero/hero-img.webp"
              alt="Storyteller HyperJail"
            />
          </div>

          <div
            className="d-flex social-icons flex-column gap-4 align-items-center"
            data-scroll
            data-scroll-speed="8"
            data-scroll-direction="horizontal"
            data-scroll-position="top"
          >
            <a href="/">
              <FontAwesomeIcon icon={faDiscord} />
            </a>
            <a href="/">
              <FontAwesomeIcon icon={faTwitch} />
            </a>
            <a href="/">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="/">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="/">
              <FontAwesomeIcon icon={faPatreon} />
            </a>
          </div>
        </div>
        <div id="about" className="bg-light section section-pb-extra">
          <div className="container py-5 text-center">
            <h1 className="fw-bold display-4">
              We're the new Hollywood and Nashville
            </h1>
            <h4 className="fw-normal opacity-75 mb-5">
              Our technology can turn anyone into a director, musician, or movie
              star.
            </h4>
            <div className="w-100 d-flex justify-content-center d-none d-lg-flex">
              <div className="red-line"></div>
            </div>
            <div className="row gx-4 gy-4 pt-4">
              <div className="col-12 col-lg-3">
                <p className="fw-normal card bg-dark">
                  Music generation - vocals, instrumentals, and more
                </p>
              </div>
              <div className="col-12 col-lg-3">
                <p className="fw-normal card bg-dark">
                  Audio dubbing and transformation
                </p>
              </div>
              <div className="col-12 col-lg-3">
                <p className="fw-normal card bg-dark">Real time animation</p>
              </div>
              <div className="col-12 col-lg-3">
                <p className="fw-normal card bg-dark">
                  Real time Hollywood VFX without going to set
                </p>
              </div>
            </div>
          </div>
          <div className="w-100 d-flex justify-content-center">
            <img
              src="/logo/Storyteller-Icon-Logo.png"
              alt="Storyteller Logo Icon"
              className="divider-logo"
            />
          </div>
        </div>
        <div id="works" className="bg-dark section">
          <div className="container py-5">test</div>
        </div>
      </div>
    </>
  );
}

export default IndexPage;
