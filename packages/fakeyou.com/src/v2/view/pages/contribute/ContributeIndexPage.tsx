import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";
import { DiscordLink } from "@storyteller/components/src/elements/DiscordLink";
import { WebUrl } from "../../../../common/WebUrl";
import { t } from "i18next";
import { Trans } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faVideo,
  faUpload,
  faImage,
  faTags,
  faHandsHelping,
  faChartArea,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../data/animation";

interface Props {
  sessionWrapper: SessionWrapper;
}

function ContributeIndexPage(props: Props) {
  const categoryHeading = props.sessionWrapper.canEditCategories()
    ? t("pages.contributeIndex.headingCreateCategory")
    : t("pages.contributeIndex.headingSuggestCategory");

  const categoryButton = props.sessionWrapper.canEditCategories()
    ? t("pages.contributeIndex.buttonCreateCategory")
    : t("pages.contributeIndex.buttonSuggestCategory");

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container py-5 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <motion.h1 className="display-5 fw-bold" variants={item}>
            {t("pages.contributeIndex.heroTitle")}
          </motion.h1>
          <motion.h3 className="mb-4" variants={item}>
            <Trans i18nKey="pages.contributeIndex.heroSubtitle">
              You make FakeYou <strong>better</strong> by contributing
            </Trans>
          </motion.h3>
          <motion.p className="pb-4" variants={item}>
            {t("pages.contributeIndex.introText")}
          </motion.p>
        </div>
      </div>

      <motion.div className="container-panel pt-2 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4 mt-3">
          <h2 className="panel-title fw-bold">
            <FontAwesomeIcon icon={faUpload} className="me-3" />
            {t("pages.contributeIndex.headingUploadModels")}
          </h2>
          <div className="py-6 d-flex flex-column gap-4">
            <p className="text-center text-lg-start">
              <Trans i18nKey="pages.contributeIndex.describeUploadModels">
                Create new voices and video templates for FakeYou.
                <DiscordLink
                  text={t("pages.contributeIndex.discordLink1")}
                  iconAfterText={true}
                />
                to learn how.
              </Trans>
            </p>
            <div className="row gx-3 gy-3">
              <div className="col-12 col-md-6">
                <Link to="/upload/tts" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faVolumeHigh} className="me-3" />
                  {t("pages.contributeIndex.buttonUploadVoice")}
                </Link>
              </div>
              <div className="col-12 col-md-6">
                <Link to="/upload/vocoder" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faChartArea} className="me-3" />
                  Upload Vocoder
                </Link>
              </div>
              <div className="col-12 col-md-6">
                <Link to="/upload/w2l_video" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faVideo} className="me-3" />
                  {t("pages.contributeIndex.buttonUploadW2lVideo")}
                </Link>
              </div>
              <div className="col-12 col-md-6">
                <Link to="/upload/w2l_photo" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faImage} className="me-3" />
                  {t("pages.contributeIndex.buttonUploadW2lPhoto")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="container-panel pt-3 pb-5" variants={item}>
        <div className="panel p-3 p-lg-4 mt-lg-0">
          <h2 className="panel-title fw-bold">
            <FontAwesomeIcon icon={faTags} className="me-3" />
            {categoryHeading}
          </h2>
          <div className="py-6 d-flex flex-column gap-4">
            <p className="text-center text-lg-start">
              {t("pages.contributeIndex.describeSuggest")}
            </p>
            <div className="d-flex gap-3">
              <Link
                to={WebUrl.createCategoryPage()}
                className="btn btn-secondary w-100"
              >
                {categoryButton}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="container-panel pt-3 pb-5">
        <div className="panel p-3 p-lg-4 load-hidden mt-lg-0">
          <h2 className="panel-title fw-bold">
            <FontAwesomeIcon icon={faHandsHelping} className="me-3" />
            {t("pages.contributeIndex.headingMore")}
          </h2>
          <div className="py-6 d-flex flex-column gap-4">
            <p className="text-center text-lg-start">
              <Trans i18nKey="pages.contributeIndex.describeMore">
                Want to contribute code, design, or data science?
                <DiscordLink
                  text={t("pages.contributeIndex.discordLink2")}
                  iconAfterText={true}
                />
                !
              </Trans>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { ContributeIndexPage };
