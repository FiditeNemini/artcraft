import {
  faArrowRight,
  faFileArrowUp,
  faFlask,
  faSparkles,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Panel } from "components/common";
import { useLocalize } from "hooks";
import React from "react";
import { Link } from "react-router-dom";

interface FakeYouDashboardProps {
  sessionWrapper: SessionWrapper;
}

export default function FakeYouDashboard(props: FakeYouDashboardProps) {
  const { t } = useLocalize("LandingPage");
  const isLoggedIn = props.sessionWrapper.isLoggedIn();

  let uploadModelSection = <></>;

  if (isLoggedIn) {
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
  }

  return (
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
              <Link to="/voice-conversion" className="btn btn-square mt-1">
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
  );
}
