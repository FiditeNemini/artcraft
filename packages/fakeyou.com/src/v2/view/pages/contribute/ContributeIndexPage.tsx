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
  faImage,
  faTags,
  faHandsHelping,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../data/animation";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { PageHeader } from "../../_common/PageHeader";
import {
  faFileArrowUp,
  faHandHoldingHeart,
} from "@fortawesome/pro-solid-svg-icons";
import { faMicrophoneStand } from "@fortawesome/pro-duotone-svg-icons";
import { faWaveformLines } from "@fortawesome/pro-regular-svg-icons";

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

  usePrefixedDocumentTitle("Contribute to FakeYou");

  const title = <>{t("pages.contributeIndex.heroTitle")}</>;
  const subText = (
    <>
      <h5 className="pb-1">
        <Trans i18nKey="pages.contributeIndex.heroSubtitle">
          You make FakeYou better by contributing
        </Trans>
      </h5>
      <div className="opacity-75">{t("pages.contributeIndex.introText")}</div>
    </>
  );
  const titleIcon = (
    <FontAwesomeIcon icon={faHandHoldingHeart} className="me-3" />
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      {/* <div className="container py-5 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <motion.h1 className=" fw-bold" variants={item}>
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
      </div> */}
      <PageHeader
        title={title}
        subText={subText}
        showButtons={false}
        titleIcon={titleIcon}
      />

      <motion.div className="container-panel pb-3" variants={panel}>
        <div className="panel p-3 py-4 p-md-4 text-center text-lg-start">
          <h2 className="fw-bold">
            <FontAwesomeIcon icon={faFileArrowUp} className="me-3" />
            {t("pages.contributeIndex.headingUploadModels")}
          </h2>
          <div className="d-flex flex-column">
            <p className="mb-4">
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
                <Link
                  to="/upload/voice_conversion"
                  className="btn btn-primary w-100"
                >
                  <FontAwesomeIcon icon={faMicrophoneStand} className="me-3" />
                  Upload Voice to Voice Model
                </Link>
              </div>
              <div className="col-12 col-md-6">
                <Link to="/upload/tts" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faVolumeHigh} className="me-3" />
                  {t("pages.contributeIndex.buttonUploadVoice")}
                </Link>
              </div>
              <div className="col-12 col-md-6">
                <Link to="/upload/vocoder" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faWaveformLines} className="me-3" />
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

      <motion.div className="container-panel pt-3 pb-3" variants={item}>
        <div className="panel p-3 py-4 p-md-4 text-center text-lg-start">
          <h2 className="fw-bold">
            <FontAwesomeIcon icon={faTags} className="me-3" />
            {categoryHeading}
          </h2>
          <div className="d-flex flex-column">
            <p className="text-center text-lg-start mb-4">
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
      <div className="container-panel pt-3">
        <div className="panel p-3 py-4 p-md-4 text-center text-lg-start">
          <h2 className="fw-bold">
            <FontAwesomeIcon icon={faHandsHelping} className="me-3" />
            {t("pages.contributeIndex.headingMore")}
          </h2>
          <div className="d-flex flex-column">
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
