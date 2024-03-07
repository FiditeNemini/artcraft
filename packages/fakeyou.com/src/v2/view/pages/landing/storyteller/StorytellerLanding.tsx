import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import FakeYouLandingHeader from "../fakeyou/FakeYouLandingHeader";

interface StorytellerLandingProps {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  inferenceJobs: Array<InferenceJob>;
  ttsInferenceJobs: Array<TtsInferenceJob>;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
  enqueueTtsJob: (jobToken: string) => void;
}

export default function StorytellerLanding({
  sessionWrapper,
  sessionSubscriptionsWrapper,
  inferenceJobs,
  ttsInferenceJobs,
  enqueueInferenceJob,
  inferenceJobsByCategory,
  enqueueTtsJob,
}: StorytellerLandingProps) {
  // const { t } = useLocalize("LandingPage");

  return (
    <>
      <FakeYouLandingHeader
        sessionWrapper={sessionWrapper}
        sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
        inferenceJobs={inferenceJobs}
        ttsInferenceJobs={ttsInferenceJobs}
        enqueueInferenceJob={enqueueInferenceJob}
        inferenceJobsByCategory={inferenceJobsByCategory}
        enqueueTtsJob={enqueueTtsJob}
      />

      {/* <Container type="panel" className="py-5">
        <Panel clear={true} className="py-lg-5">
          <div className="row g-5 g-lg-5 flex-row-reverse">
            <div className="col-12 col-md-6">
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
            <div className="col-12 col-md-6 d-flex flex-column justify-content-center text-center text-lg-start gap-2">
              <h1 className="fw-bold display-5">
                Enabling Anyone to Create Quality Movies with AI
              </h1>
              <p className="opacity-75">
                We are combining generative AI and User Generated Content to
                radically democratize both audio and video production.
              </p>
              <div className="d-flex mt-3 mt-lg-4 gap-3 justify-content-center justify-content-lg-start">
                <Button
                  icon={faArrowRight}
                  iconFlip={true}
                  label="Sign Up"
                  to="/signup"
                />
                <Button
                  icon={faCompass}
                  label="Explore"
                  variant="secondary"
                  to="/explore"
                />
              </div>
            </div>
          </div>
        </Panel>
      </Container> */}

      {/* <div className="panel rounded-0 py-5 my-5">
        <Container type="panel" className="py-lg-5">
          <Panel clear={true}>
            <div className="d-flex flex-column align-items-center rounded-0 mt-lg-4 pt-lg-4">
              <div className="d-flex flex-column align-items-center text-center cta-container">
                <h2 className="fw-bold">AI Audio Generation</h2>
                <p className="mw-300 opacity-75">{t("ctaText")}</p>
                <div className="d-flex d-lg-none align-items-center mt-2 cta-mobile">
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
            </div>
            <div className="row gy-4 mt-lg-3">
              <div className="col-12 col-md-6">
                <Panel padding={true} className="panel-inner rounded h-100">
                  <div className="d-flex gap-2">
                    <h4 className="fw-semibold mb-4 flex-grow-1">
                      <FontAwesomeIcon icon={faMessageDots} className="me-3" />
                      Text to Speech
                    </h4>
                    <Link to="/tts">
                      Try more voices{" "}
                      <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                    </Link>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    <Select label="Select a Voice" />
                    <Input
                      label="Your Text"
                      placeholder="Type what you want your character to say"
                    />
                    <div className="d-flex gap-2 justify-content-end">
                      <Button
                        label="Generate"
                        icon={faArrowRight}
                        iconFlip={true}
                      />
                    </div>
                  </div>
                </Panel>
              </div>
              <div className="col-12 col-md-6">
                <Panel padding={true} className="panel-inner rounded h-100">
                  <div className="d-flex gap-2">
                    <h4 className="fw-semibold mb-4 flex-grow-1">
                      <FontAwesomeIcon
                        icon={faWaveformLines}
                        className="me-3"
                      />
                      Voice to Voice
                    </h4>
                    <Link to="/voice-conversion">
                      Try more voices{" "}
                      <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                    </Link>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    <Select label="Select a Voice" />
                    <div className="d-flex gap-2 justify-content-end">
                      <Button
                        label="Generate"
                        icon={faArrowRight}
                        iconFlip={true}
                      />
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          </Panel>
        </Container>
      </div> */}

      {/* <Container type="panel" className="pt-5 my-5">
        <Panel padding={true}>
          <div className="d-flex flex-column align-items-center py-5">
            <h2 className="fw-bold mb-2">{t("communityTitle")}</h2>
            <p className="opacity-75">{t("communityText")}</p>
            <div className="d-flex mt-4 gap-3">
              <a
                href="https://discord.gg/fakeyou"
                target="_blank"
                rel="noreferrer"
                className="btn btn-discord"
              >
                <FontAwesomeIcon icon={faDiscord} className="me-2" />
                {t("communityButtonDiscord")}
              </a>
              <a
                href="https://twitter.com/intent/follow?screen_name=FakeYouApp"
                target="_blank"
                rel="noreferrer"
                className="btn btn-twitter"
              >
                <FontAwesomeIcon icon={faTwitter} className="me-2" />
                {t("communityButtonTwitter")}
              </a>
            </div>
          </div>
          <img
            src="/images/landing/bg-dots.webp"
            alt="background dots"
            className="dots-left-bottom me-3"
          />
        </Panel>
      </Container> */}
    </>
  );
}
