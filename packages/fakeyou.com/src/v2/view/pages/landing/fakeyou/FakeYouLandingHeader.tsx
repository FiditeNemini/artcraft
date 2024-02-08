import { faArrowRight, faStar, faUser } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { WebUrl } from "common/WebUrl";
import { Panel } from "components/common";
import { useLocalize } from "hooks";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

interface FakeYouLandingHeaderProps {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export default function FakeYouLandingHeader(props: FakeYouLandingHeaderProps) {
  const { t } = useLocalize("LandingPage");
  const isLoggedIn = props.sessionWrapper.isLoggedIn();
  const isSubscribed = props.sessionSubscriptionsWrapper.hasPaidFeatures();

  let signUpButton = <></>;
  let viewPricingButton = <></>;
  let upgradeButton = <></>;
  let myProfileButton = <></>;

  if (!isLoggedIn) {
    signUpButton = (
      <>
        <Link
          to="/signup"
          // onClick={() => {
          //   Analytics.ttsClickHeroSignup();
          // }}
        >
          <button type="button" className="btn btn-primary w-100">
            {t("heroButtonSignUp")}
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
            {t("heroButtonPricing")}
          </button>
        </Link>
      </>
    );
  }

  if (isLoggedIn) {
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
            {t("heroButtonProfile")}
          </button>
        </Link>
      </>
    );

    if (!isSubscribed) {
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
              {t("heroButtonUpgradePlan")}
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
      // "mascot/halloween_1.webp",
      // "mascot/halloween_2.webp",
      // "mascot/halloween_3.webp",
      // "mascot/xmas_1.webp",
      // "mascot/xmas_2.webp",
      // "mascot/xmas_3.webp",
      // "mascot/xmas_4.webp",
    ];

    return images[Math.floor(Math.random() * images.length)];
  }, []);

  return (
    <Panel clear={true} className="mt-5">
      {/* <Alert
              id="face-animation-alert"
              icon={faSparkles}
              message="Have you tried our new Face Animator? Turn photos of faces into animated lip-synced videos with just a picture and some audio!"
              alertVariant="new"
              link="/face-animator"
              linkText="Try it now"
            /> */}

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
    </Panel>
  );
}
