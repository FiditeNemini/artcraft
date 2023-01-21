import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { t } from "i18next";
import { Trans } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faStar,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { container, item, image, panel } from "../../../../../data/animation";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { BackLink } from "../../../_common/BackLink";

export interface EnqueueJobResponsePayload {
  success: boolean;
  inference_job_token?: string;
}

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function VcModelListPage(props: Props) {
  const randomImage = useMemo(() => {
    const images = ["mascot/vc.webp"];

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
    <motion.div initial="hidden" animate="visible" variants={container}>
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
                Voice Conversion
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

      <motion.div className="container-panel pt-4 pb-5 mb-4" variants={panel}>
        <div className="panel p-3 p-lg-4 mt-5 mt-lg-0">
          <i className="fas fa-volume-high"></i>
          <h1 className="panel-title fw-bold">
            <FontAwesomeIcon icon={faVolumeUp} className="me-3" />
            Convert Voice
          </h1>
          <div className="py-6">
            <div className="d-flex flex-column gap-4">
              <div>
                <label className="sub-title">Output Voice</label>
                <div className="form-group input-icon w-100">
                  {/* NB: See note above about this library. */}
                  <span className="form-control-feedback">
                    <FontAwesomeIcon icon={faMicrophone} />
                  </span>
                  <select className="form-select">
                    <option value="">Dummy Model</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="sub-title">Audio Input</label>
                <audio className="w-100" src="test.wav">
                  Your browser does not support the<code>audio</code> element.
                </audio>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <BackLink link="/" text="Back to main page" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export { VcModelListPage };
