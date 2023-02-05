import React, { useMemo } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { Link } from "react-router-dom";
import { Trans } from "react-i18next";
import { t } from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faUser,
  faArrowRight,
  faWaveformLines,
} from "@fortawesome/pro-solid-svg-icons";
import { item, image } from "../../../../../data/animation";
import { motion } from "framer-motion";
import { Analytics } from "../../../../../common/Analytics";
import { WebUrl } from "../../../../../common/WebUrl";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export function TtsPageHero(props: Props) {
  const randomImage = useMemo(() => {
    const images = [
      "mascot/kitsune_pose2.webp",
      "mascot/kitsune_wizard.webp",
      // "mascot/halloween_1.webp",
      // "mascot/halloween_2.webp",
      // "mascot/halloween_3.webp",
      // "mascot/xmas_1.webp",
      // "mascot/xmas_2.webp",
      // "mascot/xmas_3.webp",
      // "mascot/xmas_4.webp",
      // "mascot/chinese_new_year.webp",
    ];

    return images[Math.floor(Math.random() * images.length)];
  }, []);

  let signUpButton = <></>;
  let viewPricingButton = <></>;
  let upgradeButton = <></>;
  let myProfileButton = <></>;

  if (!props.sessionWrapper.isLoggedIn()) {
    signUpButton = (
      <>
        <Link
          to="/signup"
          onClick={() => {
            Analytics.ttsClickHeroSignup();
          }}
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
          onClick={() => {
            Analytics.ttsClickHeroViewPricing();
          }}
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
          onClick={() => {
            Analytics.ttsClickHeroViewProfile();
          }}
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
            onClick={() => {
              Analytics.ttsClickHeroUpgradePlan();
            }}
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
    <div className="container-panel hero-section pt-4 pt-lg-5 pb-5">
      <div className="panel">
        <div className="row gx-3 flex-md-row-reverse">
          <div className="col-12 col-md-5 hero-img-container d-none d-md-block">
            <motion.img
              src={randomImage}
              className="hero-img"
              alt="FakeYou Mascot"
              variants={image}
            />
          </div>
          <div className="col-12 col-md-7">
            <div className="p-3 py-4 p-md-4">
              <h1 className="fw-bold text-center text-md-start">
                <FontAwesomeIcon icon={faWaveformLines} className="me-3" />
                {t("tts.TtsModelListPage.heroSection.title")}
              </h1>
              <p className="text-center text-md-start">
                <Trans i18nKey="tts.TtsModelListPage.heroSection.subtitle">
                  Use FakeYou's deepfake tech to say stuff with your favorite
                  characters.
                </Trans>
              </p>
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-md-start mt-4">
                {upgradeButton}
                {signUpButton}
                {viewPricingButton}
                {myProfileButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
