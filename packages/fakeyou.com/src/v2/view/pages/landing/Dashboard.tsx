import {
  faFlask,
  faImage,
  faMessageDots,
  faSparkles,
  faWaveform,
  faWaveformLines,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Panel } from "components/common";
import { useLocalize } from "hooks";
import React from "react";
import { Link } from "react-router-dom";
import DashboardRow from "./components/DashboardRow";

interface DashboardProps {
  sessionWrapper: SessionWrapper;
}

export default function Dashboard(props: DashboardProps) {
  const { t } = useLocalize("LandingPage");
  const isLoggedIn = props.sessionWrapper.isLoggedIn();

  let uploadModelSection = <></>;

  if (isLoggedIn) {
    uploadModelSection = (
      <>
        <h2 className="fw-bold mb-4 mt-5 pt-4">Upload Weights</h2>
        <div className="panel p-4 rounded">
          <div className="row gy-3 zi-2">
            <div className="col-12 col-lg-4">
              <Link to="/upload/tts" className="btn btn-secondary">
                <FontAwesomeIcon icon={faMessageDots} className="me-2" />
                Upload TTS Model
              </Link>
            </div>
            <div className="col-12 col-lg-4">
              <Link to="/upload/voice_conversion" className="btn btn-secondary">
                <FontAwesomeIcon icon={faWaveformLines} className="me-2" />
                Upload V2V Model
              </Link>
            </div>
            <div className="col-12 col-lg-4">
              <Link to="/upload/vocoder" className="btn btn-secondary">
                <FontAwesomeIcon icon={faWaveform} className="me-2" />
                Upload Vocoder
              </Link>
            </div>
            <div className="col-12 col-lg-4">
              <Link to="/upload/sd" className="btn btn-secondary">
                <FontAwesomeIcon icon={faImage} className="me-2" />
                Upload Stable Diffusion Weight
              </Link>
            </div>
            <div className="col-12 col-lg-4">
              <Link to="/upload/lora" className="btn btn-secondary">
                <FontAwesomeIcon icon={faImage} className="me-2" />
                Upload LoRA weight
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const dashboardProducts = [
    {
      to: "/tts",
      title: t("productTtsTitle"),
      text: t("productTtsText"),
      imgSrc: "/images/landing/select-tts.webp",
      imgAlt: "Text to Speech",
    },
    {
      to: "/voice-conversion",
      title: t("productVcTitle"),
      text: t("productVcText"),
      imgSrc: "/images/landing/select-v2v.webp",
      imgAlt: "Voice Conversion",
    },
    {
      to: "/voice-designer",
      title: t("productVdTitle"),
      text: t("productVdText"),
      imgSrc: "/images/landing/select-vd.webp",
      imgAlt: "Voice Cloning",
      badgeContent: {
        type: "beta",
        icon: faFlask,
        label: "BETA",
      },
    },
    {
      to: "/face-animator",
      title: t("productFaceAnimatorTitle"),
      text: t("productFaceAnimatorText"),
      imgSrc: "/images/landing/select-fa.webp",
      imgAlt: "Face Animator",
    },
    {
      to: "/text-to-image",
      title: t("productImageGenTitle"),
      text: t("productImageGenText"),
      imgSrc: "/images/landing/select-tti.webp",
      imgAlt: "AI Image Generation",
      badgeContent: {
        type: "new",
        icon: faSparkles,
        label: "NEW",
      },
    },
    {
      to: "/style-video",
      title: t("productVideoStyleTransferTitle"),
      text: t("productVideoStyleTransferText"),
      imgSrc: "/images/landing/select-vst.webp",
      imgAlt: "Video Style Transfer",
      badgeContent: {
        type: "new",
        icon: faSparkles,
        label: "NEW",
      },
    },
  ];

  return (
    <Panel clear={true} className={`${!isLoggedIn ? "section" : "mt-5"}`}>
      <h1 className="fw-bold mb-4">{t("productsTitle")}</h1>

      <DashboardRow items={dashboardProducts} />

      {uploadModelSection}
    </Panel>
  );
}
