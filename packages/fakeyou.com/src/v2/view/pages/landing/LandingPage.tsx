import React from "react";
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
import { faMicrophone, faRightLeft } from "@fortawesome/pro-solid-svg-icons";
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
      <div className="container pb-5 pb-lg-0 pt-lg-2 px-md-5 px-lg-5 px-xl-3">
        <div className="row flex-md-row-reverse">
          <div className="col-12 col-lg-5 p-md-0 d-flex justify-content-center">
            <img
              src="/mascot/kitsune_pose2.webp"
              alt="FakeYou Mascot"
              width={450}
              className="img-fluid"
            />
          </div>
          <div className="col-12 col-lg-7 d-flex flex-column justify-content-center flex-reverse px-md-5 px-lg-3">
            <h1 className="fw-bold display-5 text-center text-lg-start px-md-5 px-lg-0">
              Text to Speech, Voice Conversion & AI Tools
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

      <div className="container-panel pb-5 mb-5">
        <div className="panel p-3 py-4 p-md-4">
          <div className="d-flex gap-4">
            <form
              className="w-100 d-flex flex-column"
              // onSubmit={handleFormSubmit}
            >
              <div className="row gx-5 gy-5">
                <div className="col-12 d-flex flex-column gap-4">
                  <div>
                    <label className="sub-title">
                      Choose Target Voice (xxx to choose from)
                    </label>
                    <div className="input-icon-search pb-4">
                      <span className="form-control-feedback">
                        <FontAwesomeIcon icon={faMicrophone} />
                      </span>

                      {/* <VcModelListSearch
                  voiceConversionModels={props.voiceConversionModels}
                  setVoiceConversionModels={props.setVoiceConversionModels}
                  maybeSelectedVoiceConversionModel={
                    props.maybeSelectedVoiceConversionModel
                  }
                  setMaybeSelectedVoiceConversionModel={interceptModelChange}
                /> */}
                    </div>
                  </div>

                  <ul className="nav nav-tabs nav-vc" id="myTab" role="tablist">
                    <li className="nav-item w-100" role="presentation">
                      <button
                        className="nav-link active w-100"
                        id="prerecorded-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#prerecorded"
                        type="button"
                        role="tab"
                        aria-controls="prerecorded"
                        aria-selected="true"
                      >
                        Pre-recorded
                      </button>
                    </li>
                    <li className="nav-item w-100" role="presentation">
                      <button
                        className="nav-link w-100"
                        id="recordaudio-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#recordaudio"
                        type="button"
                        role="tab"
                        aria-controls="recordaudio"
                        aria-selected="false"
                      >
                        Microphone
                      </button>
                    </li>
                  </ul>
                  <div className="tab-content" id="myTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="prerecorded"
                      role="tabpanel"
                      aria-labelledby="prerecorded-tab"
                    >
                      <div className="d-flex flex-column gap-4 h-100">
                        <div>
                          <label className="sub-title">
                            Upload Input Audio
                          </label>
                          <div className="d-flex flex-column gap-3 upload-component">
                            {/* <UploadComponent
                              setMediaUploadToken={setMediaUploadToken}
                              formIsCleared={formIsCleared}
                              setFormIsCleared={setFormIsCleared}
                              setCanConvert={setCanConvert}
                              changeConvertIdempotencyToken={
                                changeConvertIdempotencyToken
                              }
                            /> */}
                          </div>
                        </div>

                        {/*<div>
                          <label className="sub-title">
                            Or pick from your audio collection (5 files)
                          </label>
                          <div className="d-flex flex-column gap-3">
                            <div className="input-icon-search">
                              <span className="form-control-feedback">
                                <FontAwesomeIcon icon={faFiles} />
                              </span>

                              <Select
                                value="test"
                                classNames={SearchFieldClass}
                                // On mobile, we don't want the onscreen keyboard to take up half the UI.
                                autoFocus={false}
                                isSearchable={false}
                                // NB: The following settings improve upon performance.
                                // See: https://github.com/JedWatson/react-select/issues/3128
                                filterOption={createFilter({
                                  ignoreAccents: false,
                                })}
                              />
                            </div>
                          </div>
                              </div>*/}

                        <div>
                          <label className="sub-title">Convert Audio</label>

                          <div className="d-flex gap-3">
                            <button className="btn btn-primary w-100">
                              <FontAwesomeIcon
                                icon={faRightLeft}
                                className="me-2"
                              />
                              Convert
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="tab-pane fade"
                      id="recordaudio"
                      role="tabpanel"
                      aria-labelledby="recordaudio-tab"
                    >
                      <div className="d-flex flex-column gap-4 h-100">
                        <div>
                          <label className="sub-title">Record Audio</label>
                          <div className="d-flex flex-column gap-3 upload-component">
                            {/* <RecordComponent
                              setMediaUploadToken={setMediaUploadToken}
                              formIsCleared={formIsCleared}
                              setFormIsCleared={setFormIsCleared}
                              setCanConvert={setCanConvert}
                              changeConvertIdempotencyToken={
                                changeConvertIdempotencyToken
                              }
                            /> */}
                          </div>
                        </div>
                        <div>
                          <label className="sub-title">Convert Audio</label>

                          <div className="d-flex gap-3">
                            <button className="btn btn-primary w-100">
                              <FontAwesomeIcon
                                icon={faRightLeft}
                                className="me-2"
                              />
                              Convert
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container pt-3 pt-md-0 pb-5 px-md-5 px-xl-3">
        <h2 className="fw-bold mb-4">AI Tools</h2>
        <div className="row g-4 position-relative">
          <div className="col-12 col-md-4">
            <div className="panel panel-select d-flex flex-column align-items-center">
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
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="panel panel-select d-flex flex-column align-items-center">
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
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="panel panel-select d-flex flex-column align-items-center">
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
            </div>
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
      </div>

      <div className="container section mt-4 px-md-5 px-xl-3">
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
                  <source src="/videos/tts-video.webm" type="video/webm" />
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
            <h2 className="fw-bold">Make your favorite characters talk</h2>
            <p className="opacity-75">
              Our AI-powered text-to-speech and voice transformer tools let you
              convert your text or voice into your favorite character's voice.
              Perfect for content creators and anyone looking to add personality
              to their messages.
            </p>
            <div className="d-flex mt-3 gap-3">
              <Link to="/tts" className="btn btn-primary">
                Text-to-Speech
              </Link>
              <Link to="/tts" className="btn btn-primary">
                Voice Transformer
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

      <div className="d-flex flex-column section align-items-center panel rounded-0 my-5">
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
              Text-to-speech
            </Link>
            <Link to="/voice-conversion" className="btn btn-primary">
              Voice Conversion
            </Link>
          </div>
          <img
            src="/images/landing/hanashi-before.webp"
            alt="hanashi before"
            className="hanashi-before d-none d-lg-block"
          />
          <img
            src="/images/landing/chevrons-grey.webp"
            alt="grey chevrons"
            className="chevrons-grey d-none d-lg-block"
          />
          <img
            src="/images/landing/chevrons-red.webp"
            alt="red chevrons"
            className="chevrons-red d-none d-lg-block"
          />
          <img
            src="/images/landing/hanashi-after.webp"
            alt="hanashi after"
            className="hanashi-after d-none d-lg-block"
          />
        </div>
      </div>

      <div className="section pb-5">
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
            className="dots-right-top me-3"
          />
        </div>
      </div>
    </motion.div>
  );
}

export { LandingPage };
