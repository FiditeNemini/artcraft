import React from "react";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { Link } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { useLocalize } from "hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";
import {
  faCompass,
  faFileArrowUp,
  faFlask,
  faSparkles,
} from "@fortawesome/pro-solid-svg-icons";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
// import Alert from "components/common/Alert/Alert";
import {
  Button,
  Container,
  Input,
  Modal,
  Panel,
  Select,
} from "components/common";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function LandingPage(props: Props) {
  usePrefixedDocumentTitle("FakeYou Celebrity Voice Generator");
  PosthogClient.recordPageview();
  const { t } = useLocalize("LandingPage");
  const isLoggedIn = props.sessionWrapper.isLoggedIn();
  // const isSubscribed = props.sessionSubscriptionsWrapper.hasPaidFeatures();
  // const [isFocused, setIsFocused] = useState(false);

  // let signUpButton = <></>;
  // let viewPricingButton = <></>;
  // let upgradeButton = <></>;
  // let myProfileButton = <></>;
  let uploadModelSection = <></>;

  // if (!isLoggedIn) {
  //   signUpButton = (
  //     <>
  //       <Link
  //         to="/signup"
  //         // onClick={() => {
  //         //   Analytics.ttsClickHeroSignup();
  //         // }}
  //       >
  //         <button type="button" className="btn btn-primary w-100">
  //           {t("heroButtonSignUp")}
  //           <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
  //         </button>
  //       </Link>
  //     </>
  //   );
  //   viewPricingButton = (
  //     <>
  //       <Link
  //         to={WebUrl.pricingPageWithReferer("tts_hero_new")}
  //         // onClick={() => {
  //         //   Analytics.ttsClickHeroViewPricing();
  //         // }}
  //       >
  //         <button type="button" className="btn btn-secondary w-100">
  //           <FontAwesomeIcon icon={faStar} className="me-2" />
  //           {t("heroButtonPricing")}
  //         </button>
  //       </Link>
  //     </>
  //   );
  // }
  if (isLoggedIn) {
    // let displayName = props.sessionWrapper.getDisplayName() as string; // NB: If logged in, should be string
    // let url = WebUrl.userProfilePage(displayName);
    // myProfileButton = (
    //   <>
    //     <Link
    //       to={url}
    //       // onClick={() => {
    //       //   Analytics.ttsClickHeroViewProfile();
    //       // }}
    //     >
    //       <button type="button" className="btn btn-secondary w-100">
    //         <FontAwesomeIcon icon={faUser} className="me-2" />
    //         {t("heroButtonProfile")}
    //       </button>
    //     </Link>
    //   </>
    // );

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

    // if (!isSubscribed) {
    //   upgradeButton = (
    //     <>
    //       <Link
    //         to={WebUrl.pricingPageWithReferer("tts_hero_user")}
    //         // onClick={() => {
    //         //   Analytics.ttsClickHeroUpgradePlan();
    //         // }}
    //       >
    //         <button type="button" className="btn btn-primary w-100">
    //           <FontAwesomeIcon icon={faStar} className="me-2" />
    //           {t("heroButtonUpgradePlan")}
    //         </button>
    //       </Link>
    //     </>
    //   );
    // }
  }

  // const randomHeroImage = useMemo(() => {
  //   const images = [
  //     // Main Images:
  //     "mascot/kitsune_pose2.webp",
  //     // "mascot/may4th.webp",
  //     // "mascot/halloween_1.webp",
  //     // "mascot/halloween_2.webp",
  //     // "mascot/halloween_3.webp",
  //     // "mascot/xmas_1.webp",
  //     // "mascot/xmas_2.webp",
  //     // "mascot/xmas_3.webp",
  //     // "mascot/xmas_4.webp",
  //   ];

  //   return images[Math.floor(Math.random() * images.length)];
  // }, []);

  // const onFocusHandler = () => {
  //   setIsFocused(true);
  // };

  // const onBlurHandler = () => {
  //   // Search field blur/Unfocusing hack: needs a little bit of delay for the result click event to register
  //   setTimeout(() => {
  //     setIsFocused(false);
  //   }, 100);
  // };

  return (
    <>
      {isLoggedIn ? (
        <Container type="panel">
          {/* <Panel clear={true}>
            <Alert
              id="face-animation-alert"
              icon={faSparkles}
              message="Have you tried our new Face Animator? Turn photos of faces into animated lip-synced videos with just a picture and some audio!"
              alertVariant="new"
              link="/face-animator"
              linkText="Try it now"
            />

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
                  {t("heroTitle")}
                </h1>
                <p className="lead opacity-75 pb-4 text-center text-lg-start px-md-5 px-lg-0 pe-lg-5">
                  {t("heroText")}
                </p>
                <div className="d-flex flex-column flex-md-row gap-3 mt-3 mb-4 w-100 justify-content-center justify-content-lg-start">
                  {upgradeButton}
                  {signUpButton}
                  {viewPricingButton}
                  {myProfileButton}
                </div>
              </div>
            </div>
          </Panel> */}

          <Panel clear={true} className="mt-5">
            <h1 className="fw-bold mb-4">{t("productsTitle")}</h1>
            <div className="row g-4 position-relative">
              <div className="col-12 col-md-4">
                <Link
                  to="/tts"
                  className="panel panel-select d-flex flex-column align-items-center"
                >
                  <div className="d-flex px-4 pt-4 align-items-start w-100">
                    <div className="flex-grow-1">
                      <h3 className="fw-bold text-white mb-1">
                        {t("productTtsTitle")}
                      </h3>
                      <h6 className="fw-normal opacity-75 text-white">
                        {t("productTtsText")}
                      </h6>
                    </div>
                    <Link to="/tts" className="btn btn-square mt-1">
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
                  <div className="d-flex px-4 pt-4 align-items-start w-100">
                    <div className="flex-grow-1">
                      <h3 className="fw-bold text-white mb-1">
                        {t("productVcTitle")}
                      </h3>
                      <h6 className="fw-normal opacity-75 text-white">
                        {t("productVcText")}
                      </h6>
                    </div>
                    <Link
                      to="/voice-conversion"
                      className="btn btn-square mt-1"
                    >
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
                  to="/voice-designer"
                  className="panel panel-select d-flex flex-column align-items-center"
                >
                  <div className="d-flex px-4 pt-4 align-items-start w-100">
                    <div className="flex-grow-1">
                      <div className="mb-1">
                        <span className="badge-beta d-inline-flex align-items-center mb-2 me-2">
                          <FontAwesomeIcon icon={faFlask} className="me-1" />
                          BETA
                        </span>

                        <h4 className="fw-bold text-white d-inline-flex align-items-center mb-0">
                          <span>Voice Designer</span>
                        </h4>
                      </div>

                      <h6 className="fw-normal opacity-75 text-white">
                        Create your own AI voice
                      </h6>
                    </div>
                    <Link to="/voice-designer" className="btn btn-square mt-1">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>

                  <img
                    className="img-fluid"
                    src="/images/landing/select-vd.webp"
                    alt="Voice Designer"
                  />
                </Link>
              </div>
              <div className="col-12 col-md-4">
                <Link
                  to="/face-animator"
                  className="panel panel-select d-flex flex-column align-items-center"
                >
                  <div className="d-flex px-4 pt-4 align-items-start w-100">
                    <div className="flex-grow-1">
                      <div className="mb-1">
                        <span className="badge-new d-inline-flex align-items-center mb-2 me-2">
                          <FontAwesomeIcon icon={faSparkles} className="me-1" />
                          {t("productNewTag")}
                        </span>

                        <h4 className="fw-bold text-white d-inline-flex align-items-center mb-0">
                          <span>{t("productFaceAnimatorTitle")}</span>
                        </h4>
                      </div>

                      <h6 className="fw-normal opacity-75 text-white">
                        {t("productFaceAnimatorText")}
                      </h6>
                    </div>
                    <Link to="/face-animator" className="btn btn-square mt-1">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>

                  <img
                    className="img-fluid"
                    src="/images/landing/select-w2l.webp"
                    alt="Face Animator"
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
          </Panel>
        </Container>
      ) : (
        <>
          <Container type="panel" className="py-5">
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
          </Container>

          <div className="panel rounded-0 py-5 my-5">
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
                      <h4 className="fw-semibold mb-3">Text to Speech</h4>
                      <div className="d-flex flex-column gap-3">
                        <Select />
                        <Input placeholder="Type what you want your character to say" />
                      </div>
                    </Panel>
                  </div>
                  <div className="col-12 col-md-6">
                    <Panel padding={true} className="panel-inner rounded h-100">
                      <h4 className="fw-semibold mb-3">Voice to Voice</h4>
                      <div className="d-flex flex-column gap-3">
                        <Select />
                      </div>
                    </Panel>
                  </div>
                </div>
              </Panel>
            </Container>
          </div>

          <Container type="panel" className="pt-5 my-5">
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
          </Container>
        </>
      )}

      <Modal
        title="Login to FakeYou"
        show={false}
        handleClose={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
}

export { LandingPage };
