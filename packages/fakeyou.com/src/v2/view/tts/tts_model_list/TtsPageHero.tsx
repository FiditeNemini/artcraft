import React, { useMemo } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { Link } from "react-router-dom";
import { Trans } from "react-i18next";
import { t } from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { item, image } from "../../../../data/animation";
import { motion } from "framer-motion";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export function TtsPageHero(props: Props) {

  const randomImage = useMemo(() => {
    const images = [
      // "mascot/halloween_1.webp",
      // "mascot/halloween_2.webp",
      // "mascot/halloween_3.webp",

      "mascot/kitsune_pose2.webp",
      "mascot/kitsune_wizard.webp",
    ];

    return images[Math.floor(Math.random() * images.length)];
  }, []);

  let signUpButton = <></>;
  let upgradeButton = <></>;

  if (!props.sessionWrapper.isLoggedIn()) {
    signUpButton = (
      <>
        <Link to="/signup">
          <button type="button" className="btn btn-primary w-100">
            {t("tts.TtsModelListPage.heroSection.buttons.signUp")}
          </button>
        </Link>
      </>
    );
  }

  if (props.sessionWrapper.isLoggedIn()) {
    if (!props.sessionSubscriptionsWrapper.hasPaidFeatures()) {
      upgradeButton = (
        <>
          <Link to="/pricing">
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
            <Link to="/clone">
            <button type="button" className="btn btn-secondary w-100">
                {t("tts.TtsModelListPage.heroSection.buttons.cloneVoice")}
            </button>
            </Link>
        </motion.div>
        </div>
    </div>
    </div>
  );
}
