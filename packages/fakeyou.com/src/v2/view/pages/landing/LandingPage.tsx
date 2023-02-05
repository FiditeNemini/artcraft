import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../data/animation";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { t } from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faStar,
  faShapes,
  faMicrophoneAlt,
  faPaintBrush,
  faPersonRunning,
  faMusic,
  faArrowRight,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { WebUrl } from "../../../../common/WebUrl";
// import { Analytics } from "../../../../../common/Analytics";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function LandingPage(props: Props) {
  let signUpButton = <></>;
  let viewPricingButton = <></>;
  let upgradeButton = <></>;
  let myProfileButton = <></>;

  if (!props.sessionWrapper.isLoggedIn()) {
    signUpButton = (
      <>
        <Link
          to="/signup"
          // onClick={() => {
          //   Analytics.ttsClickHeroSignup();
          // }}
        >
          <button type="button" className="btn btn-primary w-100">
            {t("tts.TtsModelListPage.heroSection.buttons.signUp")}
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </button>
        </Link>
      </>
    );
    viewPricingButton = (
      <>
        <Link
          to={WebUrl.pricingPageWithReferer("tts_hero_new")}
          // onClick={() => {
          //   Analytics.ttsClickHeroViewPricing();
          // }}
        >
          <button type="button" className="btn btn-secondary w-100">
            <FontAwesomeIcon icon={faStar} className="me-2" />
            {t("tts.TtsModelListPage.heroSection.buttons.viewPricing")}
          </button>
        </Link>
      </>
    );
  }
  if (props.sessionWrapper.isLoggedIn()) {
    let displayName = props.sessionWrapper.getDisplayName() as string; // NB: If logged in, should be string
    let url = WebUrl.userProfilePage(displayName);
    myProfileButton = (
      <>
        <Link
          to={url}
          // onClick={() => {
          //   Analytics.ttsClickHeroViewProfile();
          // }}
        >
          <button type="button" className="btn btn-secondary w-100">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            View my profile
          </button>
        </Link>
      </>
    );
    if (!props.sessionSubscriptionsWrapper.hasPaidFeatures()) {
      upgradeButton = (
        <>
          <Link
            to={WebUrl.pricingPageWithReferer("tts_hero_user")}
            // onClick={() => {
            //   Analytics.ttsClickHeroUpgradePlan();
            // }}
          >
            <button type="button" className="btn btn-primary w-100">
              <FontAwesomeIcon icon={faStar} className="me-2" />
              Upgrade Plan
            </button>
          </Link>
        </>
      );
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container my-5 text-center d-flex flex-column align-items-center">
        <div>
          <motion.h1
            className="display-4 fw-bold lh-2 mb-3 zi-2"
            variants={item}
          >
            Text to Speech,
            <br />
            Voice, and AI Tools
          </motion.h1>
        </div>
        <div>
          <motion.p className="lead mw-lead mb-3 px-2" variants={item}>
            Use FakeYou deep fake technology to say stuff with your favorite
            characters.
          </motion.p>
        </div>
        <motion.div
          className="d-flex flex-column flex-md-row gap-3 justify-content-center my-4 w-100"
          variants={item}
        >
          {upgradeButton}
          {signUpButton}
          {viewPricingButton}
          {myProfileButton}
        </motion.div>
      </div>

      <motion.div className="container mt-5 mb-5" variants={panel}>
        <div className="row pt-1 pt-lg-5 gy-5">
          <div className="col-12 col-md-6 text-center">
            <Link
              to="/tts"
              className="w-100 d-flex flex-column align-items-center"
            >
              <div className="panel p-4 mt-5 mt-lg-0 panel-select">
                <img
                  className="img-fluid img-product img-tts"
                  src="/mascot/TTS-img.webp"
                  alt="Text to speech"
                />
                <h2 className="fw-bold text-white">Text to Speech</h2>
                <h6 className="fw-normal opacity-75 text-white">
                  Generate audio with your text input
                </h6>
                <div className="mt-3">
                  <div className="fw-medium">
                    Create your TTS
                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-12 col-md-6 text-center">
            <Link
              to="/channels"
              className="w-100 d-flex flex-column align-items-center"
            >
              <div className="panel p-4 mt-5 mt-lg-0 panel-select">
                <img
                  className="img-fluid img-product img-channels"
                  src="/mascot/channels.webp"
                  alt="Channels"
                />
                <h2 className="fw-bold text-white">Channels</h2>
                <h6 className="fw-normal opacity-75 text-white">
                  Watch AI Generated Streams
                </h6>
                <div className="mt-3">
                  <div className="fw-medium">
                    View channels
                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="text-center mt-2 mt-lg-5">
          <Link
            to="/video"
            className="w-100 d-flex flex-column align-items-center"
          >
            <div className="panel p-4 mt-5 mt-lg-0 mb-5 panel-select">
              <h3 className="fw-bold text-white">Lip Sync Video</h3>
              <h6 className="fw-normal opacity-75 text-white">
                Generate lip sync videos with your audio
              </h6>
              <div className="mt-3">
                <div className="fw-medium">
                  Create lip sync video
                  <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>

      <motion.div className="container-panel py-5" variants={panel}>
        <div className="d-flex flex-column align-items-center text-center"></div>
        <div className="d-flex justify-content-center">
          <div className="panel p-3 p-md-4 d-flex flex-column align-items-center justify-content-center">
            <h2 className="panel-title fw-bold">
              <FontAwesomeIcon icon={faShapes} className="me-3" />
              Upcoming Features
            </h2>
            <div className="py-6 d-flex flex-column justify-content-center align-items-center">
              <p className="text-center mb-5">
                Here are some of the stuff that we have planned/coming up in the
                future:
              </p>
              <div className="row gy-4 w-75">
                <div className="col-12 col-md-6">
                  <h6 className="fw-normal text-white mb-0 d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon
                      icon={faMicrophoneAlt}
                      className="fs-4 me-3"
                    />
                    Voice Conversion App
                  </h6>
                </div>
                <div className="col-12 col-md-6">
                  <h6 className="fw-normal text-white mb-0 d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon
                      icon={faPaintBrush}
                      className="fs-4 me-3"
                    />
                    Concept Art Generation
                  </h6>
                </div>
                <div className="col-12 col-md-6">
                  <h6 className="fw-normal text-white mb-0 d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon
                      icon={faPersonRunning}
                      className="fs-4 me-3"
                    />
                    3D Animation
                  </h6>
                </div>
                <div className="col-12 col-md-6">
                  <h6 className="fw-normal text-white mb-0 d-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faMusic} className="fs-4 me-3" />
                    Music Generation
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="container-panel my-5 py-5" variants={panel}>
        <div className="panel p-3 p-lg-4 d-flex flex-column align-items-center justify-content-center">
          <h2 className="panel-title fw-bold">
            <FontAwesomeIcon icon={faUsers} className="me-3" />
            Join Our Community
          </h2>
          <p className="text-center mt-3 mb-4">
            We'd love to chat with you!
            <br />
            Please join us in Discord if you have any questions.
          </p>
          <div className="d-flex flex-column flex-lg-row gap-3 mt-3 align-items-center">
            <a
              href="https://twitter.com/intent/follow?screen_name=FakeYouApp"
              rel="noreferrer"
              target="_blank"
            >
              <button className="btn btn-secondary">
                <FontAwesomeIcon icon={faTwitter} className="me-2" />
                Follow on Twitter
              </button>
            </a>
            <a
              href="https://discord.gg/fakeyou"
              rel="noreferrer"
              target="_blank"
            >
              <button className="btn btn-primary">
                <FontAwesomeIcon icon={faDiscord} className="me-2" />
                Join our Discord
              </button>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { LandingPage };
