import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { container } from "../../../../data/animation";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { t } from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faArrowRight,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { WebUrl } from "../../../../common/WebUrl";
import { faFileArrowUp } from "@fortawesome/pro-solid-svg-icons";
import posthog from 'posthog-js'
// import {
//   faFileArrowUp,
//   faMicrophone,
//   faRightLeft,
// } from "@fortawesome/pro-solid-svg-icons";
// import { Analytics } from "../../../../../common/Analytics";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function LandingPage(props: Props) {
  posthog.capture('$pageview');

  let signUpButton = <></>;
  let viewPricingButton = <></>;
  let upgradeButton = <></>;
  let myProfileButton = <></>;
  let uploadModelSection = <></>;

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

    uploadModelSection = (
      <>
        <h2 className="fw-bold mb-4 mt-5 pt-4">Upload Models</h2>
        <div className="panel p-4 rounded">
          <div className="row gy-3 zi-2">
            <div className="col-12 col-lg-4">
              <Link to="/upload/tts" className="btn btn-secondary">
                <FontAwesomeIcon icon={faFileArrowUp} className="me-2" />
                Upload TTS Model
              </Link>
            </div>
            <div className="col-12 col-lg-4">
              <Link to="/upload/voice_conversion" className="btn btn-secondary">
                <FontAwesomeIcon icon={faFileArrowUp} className="me-2" />
                Upload V2V Model
              </Link>
            </div>
            <div className="col-12 col-lg-4">
              <Link to="/upload/w2l_photo" className="btn btn-secondary">
                <FontAwesomeIcon icon={faFileArrowUp} className="me-2" />
                Upload W2L Model
              </Link>
            </div>
          </div>
        </div>
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

  const randomHeroImage = useMemo(() => {
    const images = [
      // Main Images:
      "mascot/kitsune_pose2.webp",
      // "mascot/may4th.webp",
    ];

    return images[Math.floor(Math.random() * images.length)];
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pb-5 pb-lg-0 pt-lg-4 px-md-5 px-lg-5 px-xl-3">
        {/* Community Commissions Alert */}
        {/* <div className="alert alert-info">
          <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
          <span className="fw-medium">
            Get rewarded from our $15k prize pool for creating Voice to Voice
            models!
          </span>
          <Link to="/commissions" className="fw-semibold ms-2">
            See details <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
          </Link>
        </div> */}

        <div className="row flex-md-row-reverse">
          <div className="col-12 col-lg-5 p-md-0 d-flex justify-content-center">
            <img
              src={randomHeroImage}
              alt="FakeYou Mascot"
              height={440}
              width={447}
              className="img-fluid"
            />
          </div>
          <div className="col-12 col-lg-7 d-flex flex-column justify-content-center flex-reverse px-md-5 px-lg-3">
            <h1 className="fw-bold display-5 text-center text-lg-start px-md-5 px-lg-0">
              AI Music, Text to Speech,
              <br />
              and Voice to Voice
            </h1>
            <p className="lead opacity-75 pb-4 text-center text-lg-start px-md-5 px-lg-0 pe-lg-5">
              Generate audio or videos of your favorite characters saying
              anything you want with FakeYou's deep fake tech.
            </p>
            <div className="d-flex flex-column flex-md-row gap-3 mt-3 mb-4 w-100 justify-content-center justify-content-lg-start">
              {upgradeButton}
              {signUpButton}
              {viewPricingButton}
              {myProfileButton}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="container-panel pb-5 mb-4">
        <div className="panel p-3 py-4 p-md-4">
          <form
            className="w-100 d-flex flex-column"
            // onSubmit={handleFormSubmit}
          >
            <div className="row gx-5 gy-4">
              <div className="col-12 col-md-6 d-flex flex-column gap-4">
                <div>
                  <label className="sub-title">
                    Pick a Voice (xxx to choose from)
                  </label>
                  <div className="input-icon-search pb-4">
                    <span className="form-control-feedback">
                      <FontAwesomeIcon icon={faMicrophone} />
                    </span>

                    <VcModelListSearch
                  voiceConversionModels={props.voiceConversionModels}
                  setVoiceConversionModels={props.setVoiceConversionModels}
                  maybeSelectedVoiceConversionModel={
                    props.maybeSelectedVoiceConversionModel
                  }
                  setMaybeSelectedVoiceConversionModel={interceptModelChange}
                />
                  </div>
                </div>
                <p className="mt-4">
                  <span className="opacity-75">
                    Pick one to get started, or choose from
                  </span>{" "}
                  <Link to="/tts">thousands more!</Link>
                </p>
              </div>
              <div className="col-12 col-md-6 d-flex flex-column">
                <label className="sub-title">Select Your Input</label>
                <div className="d-flex flex-column flex-lg-row gap-3">
                  <button className="btn btn-primary w-100">
                    <FontAwesomeIcon icon={faRightLeft} className="me-2" />
                    Text
                  </button>
                  <button className="btn btn-primary w-100">
                    <FontAwesomeIcon icon={faFileArrowUp} className="me-2" />
                    Upload
                  </button>
                  <button className="btn btn-primary w-100">
                    <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                    Microphone
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div> */}

      <div className="container pb-4 px-md-5 px-xl-3">
        <h2 className="fw-bold mb-4">AI Tools</h2>
        <div className="row g-4 position-relative">
          <div className="col-12 col-md-4">
            <Link
              to="/tts"
              className="panel panel-select d-flex flex-column align-items-center"
            >
              <div className="d-flex px-4 pt-4 align-items-center w-100">
                <div className="flex-grow-1">
                  <h3 className="fw-bold text-white mb-1">Text to Speech</h3>
                  <h6 className="fw-normal opacity-75 text-white">
                    Generate audio from text
                  </h6>
                </div>
                <Link to="/tts" className="btn btn-square">
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>

              <img
                className="img-fluid"
                src="/images/landing/select-tts.webp"
                alt="Text to speech"
              />
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link
              to="/voice-conversion"
              className="panel panel-select d-flex flex-column align-items-center"
            >
              <div className="d-flex px-4 pt-4 align-items-center w-100">
                <div className="flex-grow-1">
                  <h3 className="fw-bold text-white mb-1">Voice to Voice</h3>
                  <h6 className="fw-normal opacity-75 text-white">
                    Speak as someone else
                  </h6>
                </div>
                <Link to="/voice-conversion" className="btn btn-square">
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>

              <img
                className="img-fluid"
                src="/images/landing/select-vc.webp"
                alt="Voice Conversion"
              />
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <Link
              to="/video"
              className="panel panel-select d-flex flex-column align-items-center"
            >
              <div className="d-flex px-4 pt-4 align-items-center w-100">
                <div className="flex-grow-1">
                  <h3 className="fw-bold text-white mb-1">Video Lip Sync</h3>
                  <h6 className="fw-normal opacity-75 text-white">
                    Lip sync video to audio
                  </h6>
                </div>
                <Link to="/video" className="btn btn-square">
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>

              <img
                className="img-fluid"
                src="/images/landing/select-w2l.webp"
                alt="Video Lip Sync"
              />
            </Link>
          </div>
          <img
            src="/images/landing/bg-dots.webp"
            alt="background dots"
            className="dots-right-top"
          />
          <img
            src="/images/landing/bg-dots.webp"
            alt="background dots"
            className="dots-left-bottom"
          />
        </div>

        {uploadModelSection}
      </div>

      <div className="container section px-md-5 px-xl-3">
        <div className="row g-4 g-lg-5 flex-row-reverse">
          <div className="col-12 col-md-6 col-lg-7">
            <div className="position-relative">
              <div className="ratio ratio-16x9 video-container">
                <video
                  autoPlay={true}
                  playsInline={true}
                  loop={true}
                  muted={true}
                >
                  <source src="/videos/tts-video.mp4" type="video/mp4" />
                </video>
              </div>
              <img
                src="/images/landing/bg-dots.webp"
                alt="background dots"
                className="dots-right-bottom"
              />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-5 d-flex flex-column justify-content-center gap-3">
            <h2 className="fw-bold">Speak as your favorite characters</h2>
            <p className="opacity-75">
              Our AI-powered text-to-speech and voice conversion tools let you
              convert your text or voice into your favorite character's voice.
              Perfect for content creators and anyone looking to add personality
              to their messages.
            </p>
            <div className="d-flex mt-3 gap-3">
              <Link to="/tts" className="btn btn-primary">
                Text to Speech
              </Link>
              <Link to="/voice-conversion" className="btn btn-primary">
                Voice to Voice
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="container section px-md-5 px-xl-3">
        <div className="row g-4 g-lg-5">
          <div className="col-12 col-md-6 col-lg-7">
            <div className="position-relative">
              <div className="ratio ratio-16x9 video-container position-relative">
                <video
                  autoPlay={true}
                  playsInline={true}
                  loop={true}
                  muted={true}
                >
                  <source src="/videos/tts-video.webm" type="video/webm" />
                </video>
              </div>
              <img
                src="/images/landing/bg-dots.webp"
                alt="background dots"
                className="dots-left-bottom"
              />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-5 d-flex flex-column justify-content-center gap-3">
            <h2 className="fw-bold">Speak as your favorite characters</h2>
            <p className="opacity-75">
              Transform your speaking voice into someone else's voice with our
              cutting-edge voice conversion service. Just upload or record your
              audio and let our AI-powered technology do the rest. Perfect for
              entertainment, voiceovers, and language learning materials.
            </p>
            <div className="d-flex mt-3">
              <Link to="/voice-conversion" className="btn btn-primary">
                Convert your voice
              </Link>
            </div>
          </div>
        </div>
      </div> */}

      {/* <div className="d-flex flex-column section align-items-center panel rounded-0 my-5">
        <div className="d-flex flex-column align-items-center text-center cta-container">
          <div className="d-flex d-lg-none align-items-center mb-4 cta-mobile">
            <img
              src="/images/landing/hanashi-before.webp"
              alt="hanashi before"
              width={200}
              height={200}
            />
            <img
              src="/images/landing/chevrons-red.webp"
              alt="red chevrons"
              width={95}
              height={80}
            />
            <img
              src="/images/landing/hanashi-after.webp"
              alt="hanashi after"
              width={200}
              height={200}
            />
          </div>
          <h2 className="fw-bold">Generate Your Audio</h2>
          <p className="mw-300 opacity-75">
            Transform your messages and speaking voice into your favorite
            character's voice with just a few clicks.
          </p>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <Link to="/tts" className="btn btn-primary">
              Text to speech
            </Link>
            <Link to="/voice-conversion" className="btn btn-primary">
              Voice to Voice
            </Link>
          </div>
          <img
            src="/images/landing/hanashi-before.webp"
            alt="hanashi before"
            className="hanashi-before d-none d-lg-block"
            width={311}
            height={311}
          />
          <img
            src="/images/landing/chevrons-grey.webp"
            alt="grey chevrons"
            className="chevrons-grey d-none d-lg-block"
            width={127}
            height={108}
          />
          <img
            src="/images/landing/chevrons-red.webp"
            alt="red chevrons"
            className="chevrons-red d-none d-lg-block"
            width={127}
            height={108}
          />
          <img
            src="/images/landing/hanashi-after.webp"
            alt="hanashi after"
            className="hanashi-after d-none d-lg-block"
            width={311}
            height={311}
          />
        </div>
      </div> */}

      <div className="py-4">
        <div className="container text-center community-container">
          <div className="panel px-4 py-5 d-flex flex-column align-items-center community-container rounded">
            <h2 className="fw-bold mb-2">Join the Community</h2>
            <p className="opacity-75">
              We'd love to chat with you! Please join us in Discord if you have
              any questions.
            </p>
            <div className="d-flex mt-4 gap-3">
              <a
                href="https://discord.gg/fakeyou"
                target="_blank"
                rel="noreferrer"
                className="btn btn-discord"
              >
                <FontAwesomeIcon icon={faDiscord} className="me-2" />
                Discord
              </a>
              <a
                href="https://twitter.com/intent/follow?screen_name=FakeYouApp"
                target="_blank"
                rel="noreferrer"
                className="btn btn-twitter"
              >
                <FontAwesomeIcon icon={faTwitter} className="me-2" />
                Twitter
              </a>
            </div>
          </div>
          <img
            src="/images/landing/bg-dots.webp"
            alt="background dots"
            className="dots-left-bottom me-3"
          />
        </div>
      </div>
    </motion.div>
  );
}

export { LandingPage };
