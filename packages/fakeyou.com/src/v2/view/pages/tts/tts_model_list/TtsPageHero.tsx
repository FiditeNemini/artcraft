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
} from "@fortawesome/free-solid-svg-icons";
import { item, image } from "../../../../../data/animation";
import { motion } from "framer-motion";
import { Analytics } from "../../../../../common/Analytics";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export function TtsPageHero(props: Props) {
  const randomImage = useMemo(() => {
    const images = [
      // "mascot/kitsune_pose2.webp",
      // "mascot/kitsune_wizard.webp",
      // "mascot/halloween_1.webp",
      // "mascot/halloween_2.webp",
      // "mascot/halloween_3.webp",
      // "mascot/xmas_1.webp",
      // "mascot/xmas_2.webp",
      // "mascot/xmas_3.webp",
      // "mascot/xmas_4.webp",
      "mascot/chinese_new_year.webp",
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
          to="/pricing"
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
    let displayName = props.sessionWrapper.getDisplayName();
    let url = `/profile/${displayName}`;
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
            to="/pricing"
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
    <div className="container hero-section">
      <div className="row gx-3 flex-lg-row-reverse align-items-center">
        <div className="col-lg-6">
          <div className="d-flex justify-content-center">
            <motion.img
              src={randomImage}
              className="img-fluid"
              width="516"
              height="508"
              alt="FakeYou Mascot"
              variants={image}
            />
          </div>
        </div>
        <div className="col-lg-6 px-md-2 px-lg-5 px-xl-2">
          <div>
            <motion.h1
              className="display-3 fw-bold lh-1 mb-3 text-center text-lg-start"
              variants={item}
            >
              {t("tts.TtsModelListPage.heroSection.title")}
            </motion.h1>
            <motion.p
              className="lead mb-5 text-center text-lg-start pe-xl-2"
              variants={item}
            >
              <Trans i18nKey="tts.TtsModelListPage.heroSection.subtitle">
                Use FakeYou's deepfake tech to say stuff with your favorite
                characters.
              </Trans>
            </motion.p>
          </div>

          <motion.div
            className="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-lg-start mb-5 mb-lg-4"
            variants={item}
          >
            {upgradeButton}
            {signUpButton}
            {viewPricingButton}
            {myProfileButton}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
