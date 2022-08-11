import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { LoggedInIndex } from "./subpages/LoggedInIndex";
import { LoggedOutIndex } from "./subpages/LoggedOutIndex";

interface Props {
  sessionWrapper: SessionWrapper;
}

function IndexPage(props: Props) {
  return (
    <div>
      <div className="bg-hero">
        <div className="hero-section d-flex flex-column align-items-center">
          <div className="hero-inner container-fluid d-flex flex-column align-items-center justify-content-center">
            <h1 className="display-3 fw-bold mb-3 parent">
              Text to Speech For <span className="word">Your Stream</span>
            </h1>
            <p className="hero-text lead mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="panel-ani mt-4 d-flex gap-3 flex-column flex-md-row">
              <button
                type="button"
                className="btn btn-primary btn-hero load-hidden"
              >
                Sign Up Now<i className="fa-solid fa-arrow-right-long ms-2"></i>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-hero load-hidden"
              >
                <i className="fa-brands fa-discord me-2"></i>Join Discord
              </button>
            </div>
          </div>

          <div className="hero-img-section noselect">
            <img className="hero-img" src="assets/hero-kitsune.png" alt="" />
            <div className="d-none d-md-flex" id="hero-audio-wave"></div>
            <img
              className="hero-floor d-none d-md-flex"
              src="assets/hero-bg-floor.png"
              alt=""
            />

            <div className="panel hero-floating-panel hero-floating-panel-left d-none d-lg-block">
              <h6 className="pb-0">
                <i className="fa-solid fa-volume-high me-2"></i>Tracer
                (Overwatch)
              </h6>
              <p className="hero-floating-panel-text">
                “Look out world! Tracer's here.”
              </p>
            </div>
            <div className="panel hero-floating-panel hero-floating-panel-right d-none d-lg-block">
              <h6 className="pb-0">
                <i className="fa-solid fa-volume-high me-2"></i>Sonic the
                Hedgehog
              </h6>
              <p className="hero-floating-panel-text">
                "This is what speed looks like."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="features-bg" id="features">
        <div className="container section d-flex flex-column align-items-center">
          <div className="d-flex justify-content-center align-items-center gap-4">
            <img className="rotateimg180" src="assets/title-shape.png" alt="" />
            <h6 className="pre-heading text-center fw-bold pt-2">Features</h6>
            <img src="assets/title-shape.png" alt="" />
          </div>
          <h1 className="display-5 fw-bold mt-3">
            <span className="word">TTS Features</span>
          </h1>
          <div className="features-section">
            <div className="row">
              <div className="col-md-4 d-flex align-items-stretch">
                <div className="panel features-panel features-panel-sides panel-ani">
                  <img
                    className="features-icon red-glow"
                    src="assets/channel-points-icon.png"
                    alt=""
                    width="65"
                  />
                  <h4 className="features-title mb-3">Channel Points</h4>
                  <p className="mb-4">
                    Morbi dapibus commodo porta. Sed faucibus tristique orci in
                    tristique. Praesent quam nunc, fermentum eu feugiat sit.
                  </p>
                  <a className="fw-bold" href="">
                    Sign up now
                  </a>
                </div>
              </div>
              <div className="col-md-4 d-flex align-items-stretch">
                <div className="panel features-panel panel-ani">
                  <img
                    className="features-icon red-glow"
                    src="assets/voices-icon.png"
                    alt=""
                    width="80"
                  />
                  <h4 className="features-title mb-3">Over 1700 voices!</h4>
                  <p className="mb-4">
                    Morbi dapibus commodo porta. Sed faucibus tristique orci in
                    tristique. Praesent quam nunc, fermentum eu feugiat sit.
                  </p>
                  <a className="fw-bold" href="">
                    See all the voices on FakeYou
                  </a>
                </div>
              </div>
              <div className="col-md-4 d-flex align-items-stretch">
                <div className="panel features-panel features-panel-sides panel-ani">
                  <img
                    className="features-icon red-glow"
                    src="assets/bits-icon.png"
                    alt=""
                    width="65"
                  />
                  <h4 className="features-title mb-3">Bits</h4>
                  <p className="mb-4">
                    Morbi dapibus commodo porta. Sed faucibus tristique orci in
                    tristique. Praesent quam nunc, fermentum eu feugiat sit.
                  </p>
                  <a className="fw-bold" href="">
                    Sign up now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="insights-bg">
        <div className="container section d-flex flex-column align-items-center">
          <div className="row insights-section align-items-center">
            <div className="col-md-6 mb-4 mb-md-0 text-center text-md-start">
              <div className="d-flex justify-content-center justify-content-md-start align-items-center gap-4">
                <img
                  className="rotateimg180 d-block d-md-none"
                  src="assets/title-shape.png"
                  alt=""
                />
                <h6 className="pre-heading fw-bold pt-2">Statistics</h6>
                <img src="assets/title-shape.png" alt="" />
              </div>
              <h1 className="display-5 fw-bold mb-4 mt-3">
                <span className="word">Our Insights</span>
              </h1>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <div className="col-md-6">
              <div className="panel insights-panel h-100 panel-ani">
                <h2 className="fw-bold mb-1">+1700</h2>
                <p>TTS Voices in the library (and growing)</p>
                <hr />
                <h2 className="fw-bold mb-1">+10K</h2>
                <p>Daily generated TTS or something</p>
                <hr />
                <h2 className="fw-bold mb-1">+1.1M</h2>
                <p>Some kind of statistic here</p>
                <img
                  className="red-glow insights-circle-1"
                  src="assets/circle-1.png"
                  alt=""
                />
                <img
                  className="red-glow insights-circle-2"
                  src="assets/circle-1.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="faq-bg">
        <div className="container section d-flex flex-column align-items-center">
          <div className="d-flex justify-content-center align-items-center gap-4">
            <img className="rotateimg180" src="assets/title-shape.png" alt="" />
            <h6 className="pre-heading text-center fw-bold pt-2">
              Questions and Answers
            </h6>
            <img src="assets/title-shape.png" alt="" />
          </div>
          <h1 className="display-5 fw-bold mt-3 text-center d-none d-lg-block">
            <span className="word">Frequently Asked Questions</span>
          </h1>
          <h1 className="display-5 fw-bold mt-3 text-center d-lg-none">
            <span className="word">FAQ</span>
          </h1>

          <div className="faq-panel pt-5 w-100">
            <div
              className="accordion d-flex flex-column gap-3"
              id="accordionExample"
            >
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="false"
                    aria-controls="collapseOne"
                  >
                    What is Storyteller TTS?
                  </button>
                </h2>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingTwo">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo"
                    aria-expanded="false"
                    aria-controls="collapseTwo"
                  >
                    How do I use Storyteller TTS?
                  </button>
                </h2>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingTwo"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingThree">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree"
                  >
                    What is this question?
                  </button>
                </h2>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingThree"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="community-bg">
        <div className="container section mb-3 d-flex flex-column align-items-center">
          <div className="d-flex justify-content-center align-items-center gap-4">
            <img className="rotateimg180" src="assets/title-shape.png" alt="" />
            <h6 className="pre-heading text-center fw-bold pt-2">
              Still got questions?
            </h6>
            <img src="assets/title-shape.png" alt="" />
          </div>
          <h1 className="display-5 fw-bold mb-4 mt-3">
            <span className="word">Join Our Community</span>
          </h1>
          <p className="lead text-center mb-5">
            We'd love to chat with you!
            <br />
            Please join us in Discord so that we know what you're thinking.
          </p>
          <div className="d-flex flex-column flex-lg-row gap-3 mb-5">
            <button className="btn btn-secondary">
              <i className="fa-brands fa-twitter me-2"></i>Follow on Twitter
            </button>
            <button className="btn btn-primary">
              <i className="fa-brands fa-discord me-2"></i>Join our Discord
            </button>
          </div>
        </div>
      </div>

      <div className="container section d-flex flex-column align-items-center">
        <div className="cta-panel panel-ani">
          <div className="row">
            <div className="col-md-6 parent">
              <img className="cta-img w-100" src="assets/cta-img.png" alt="" />
            </div>
            <div className="col-md-6 cta-right text-center text-sm-start px-5">
              <h1 className="display-5 fw-bold mb-5">
                Get started with Storyteller Stream!
              </h1>
              <button className="btn btn-secondary w-100">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { IndexPage };
