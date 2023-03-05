import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faHeadphones,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { VoicePreviewPlayer } from "./VoicePreviewPlayer";
import { wavesurferConfigs } from "./wsConfig";

interface Props {
  sessionWrapper: SessionWrapper;
}

let wavesurfers = wavesurferConfigs.map((config) => {
  let ws = (
    <VoicePreviewPlayer filename={config.filename} title={config.title} />
  );
  return ws;
});

function IndexPage(props: Props) {
  return (
    <div>
      <div className="bg-hero">
        <div className="hero-section d-flex flex-column align-items-center">
          <div className="hero-inner container-fluid d-flex flex-column align-items-center justify-content-center">
            <h1 className="display-3 fw-bold mb-3 parent">
              AI Power for <br className="d-sm-none" />
              <span className="word">Your Stream</span>
            </h1>
            <p className="hero-text lead mb-4 px-3 px-lg-5">
              We use advanced AI to enhance your stream, making it easier for
              you to engage your audience and get paid for the work you love.
            </p>
            <div className="panel-ani mt-4 d-flex gap-3 flex-column flex-md-row">
              <a
                href="https://dash.power.stream/signup"
                className="btn btn-primary btn-hero d-flex align-items-center"
              >
                Sign Up Now
                <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
              </a>
              <a
                href="https://discord.gg/fakeyou"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-hero d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faDiscord} className="me-2" />
                Join Discord
              </a>
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

            {
              <div className="panel hero-floating-panel hero-floating-panel-left d-none d-lg-block">
                <h6 className="pb-0">
                  <FontAwesomeIcon icon={faVolumeUp} className="me-2" />
                  Tracer (Overwatch)
                </h6>
                <p className="hero-floating-panel-text">
                  “Look out world! Tracer's here.”
                </p>
              </div>
            }
            <div className="panel hero-floating-panel hero-floating-panel-right d-none d-lg-block">
              <h6 className="pb-0">
                <FontAwesomeIcon icon={faVolumeUp} className="me-2" />
                Sonic the Hedgehog
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
                    Your viewers can use their hard-earned channel points to
                    donate and have their messages read aloud. This adds a fun
                    new way for your community to engage with your streams and
                    show their support.
                  </p>
                  <a className="fw-bold" href="https://fakeyou.com">
                    Sign up now
                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
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
                  <h4 className="features-title mb-3">Over 2000 voices!</h4>
                  <p className="mb-4">
                    We're proud to offer over 2000 text-to-speech voices for you
                    to choose from. Whether you're looking for something funny,
                    serious, or somewhere in between, we've got you covered.
                  </p>
                  <a className="fw-bold" href="https://fakeyou.com">
                    See all the voices on FakeYou
                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
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
                    Your viewers can use Twitch Bits to donate and have their
                    messages read aloud. This makes it easy for anyone to get
                    involved and support your stream.
                    <br />
                    <br />
                  </p>
                  <a className="fw-bold" href="https://fakeyou.com">
                    Sign up now
                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="voices-bg" id="voices">
        <div className="container section d-flex flex-column align-items-center">
          <div className="d-flex justify-content-center align-items-center gap-4">
            <img className="rotateimg180" src="assets/title-shape.png" alt="" />
            <h6 className="pre-heading text-center fw-bold pt-2">TTS Voices</h6>
            <img src="assets/title-shape.png" alt="" />
          </div>
          <h1 className="display-5 fw-bold mt-3">
            <span className="word">Voice Previews</span>
          </h1>
          <div className="voices-section">
            <div className="row gx-3 gy-3 gx-lg-4 gy-lg-4">{wavesurfers}</div>
            <div className="mt-5 pt-2 d-flex flex-column gap-4">
              <p className="lead">
                These are just a few samples of the voices available! Listen to
                <span className="fw-bold"> 2000+</span> more usable voices on
                our TTS platform FakeYou.
              </p>
              <div>
                <a
                  className="btn btn-primary"
                  href="https://fakeyou.com"
                  rel="noreferrer"
                  target="_blank"
                >
                  <FontAwesomeIcon icon={faHeadphones} className="me-3" />
                  Listen to 2000+ more voices!
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="insights-bg" id="insights">
        <div className="container section d-flex flex-column align-items-center">
          <div className="row insights-section align-items-center">
            <div className="col-md-6 mb-4 mb-md-0 text-center text-md-start">
              <div className="d-flex justify-content-center justify-content-md-start align-items-center gap-4">
                <img
                  className="rotateimg180 d-block d-md-none"
                  src="assets/title-shape.png"
                  alt=""
                />
                <h6 className="pre-heading fw-bold pt-2">It's Obvious</h6>
                <img src="assets/title-shape.png" alt="" />
              </div>
              <h1 className="display-5 fw-bold mb-4 mt-3">
                <span className="word">Better Streams Grow</span>
              </h1>
              <p>
                We empower streamers to make incredible content. Use the power
                of AI to do the hard work so you can focus on what matters.
              </p>
            </div>
            <div className="col-md-6">
              <div className="panel insights-panel h-100 panel-ani">
                <h2 className="fw-bold mb-1">2000+</h2>
                <p>AI models and features to enrich your stream.</p>
                <hr />
                <h2 className="fw-bold mb-1">40%</h2>
                <p>Revenue boost by engaging your audience.</p>
                <hr />
                <h2 className="fw-bold mb-1">1+</h2>
                <p>human centuries of content we’ve helped enrich.</p>
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

      <div className="faq-bg" id="faq">
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
                    PowerStream TTS?
                  </button>
                </h2>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    PowerStream TTS lets your audience inject AI TTS sound into
                    your stream. You can engage with them directly and earn
                    money from every use.
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
                    PowerStream Autopilot?
                  </button>
                </h2>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingTwo"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    Coming soon. Use our advanced AI body double to run your
                    stream while you’re away. It can fill in for bathroom
                    breaks, or run 24/7, directly engaging your audience with
                    custom-tailored content and your own unique personality.
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
                    PowerStream Transformer?
                  </button>
                </h2>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingThree"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    Coming soon. Your community can donate to change your face
                    and voice to that of popular characters and celebrities.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="community-bg" id="community">
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
            <a
              className="btn btn-secondary"
              href="https://twitter.com/FakeYouApp"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faTwitter} className="me-2" />
              Follow on Twitter
            </a>
            <a
              className="btn btn-primary"
              href="https://discord.gg/fakeyou"
              target="_blank"
              rel="noreferrer"
            >
              <FontAwesomeIcon icon={faDiscord} className="me-2" />
              Join our Discord
            </a>
          </div>
        </div>
      </div>

      <div className="container section pt-5 d-flex flex-column align-items-center">
        <div className="cta-panel panel-ani">
          <div className="row">
            <div className="col-md-6 parent">
              <img
                className="cta-img w-100"
                src="assets/cta-img.png"
                alt="cta mascot"
              />
            </div>
            <div className="col-md-6 cta-right text-center text-sm-start px-4 px-lg-5">
              <h1 className="display-5 fw-bold mb-5">
                Get started with Power Stream!
              </h1>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <a
                  className="btn btn-cta w-100"
                  href="https://dash.power.stream/signup"
                >
                  Sign Up
                  <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                </a>
                <a
                  className="btn btn-cta w-100"
                  target="_blank"
                  rel="noreferrer"
                  href="https://discord.gg/fakeyou"
                >
                  <FontAwesomeIcon icon={faDiscord} className="me-2" />
                  Join Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { IndexPage };
