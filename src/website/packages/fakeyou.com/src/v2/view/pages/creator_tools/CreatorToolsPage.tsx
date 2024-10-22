import {
  faFlask,
  faPortalEnter,
  faScrewdriverWrench,
  faSparkles,
} from "@fortawesome/pro-solid-svg-icons";
import {
  GetWebsite,
  WEBSITE,
  Website,
} from "@storyteller/components/src/env/GetWebsite";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { Button, Container, Panel } from "components/common";
import { useLocalize } from "hooks";
import React from "react";
import { AIToolsRow } from "components/marketing";
import "./CreatorTools.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CreatorToolsPage() {
  const { t } = useLocalize("LandingPage");

  usePrefixedDocumentTitle("Creator Tools");

  type Item = {
    to?: string;
    externalLink?: string;
    title: string;
    text: string;
    imgSrc?: string;
    imgAlt: string;
    videoSrc?: string;
    videoPosterSrc?: string;
    badgeContent?: {
      type: string;
      icon: any;
      label: string;
    };
    videoPosition?: "top" | "center";
  };

  const videoProducts: Item[] = [
    // {
    //   to: "/text-to-image",
    //   title: t("productImageGenTitle"),
    //   text: t("productImageGenText"),
    //   imgSrc: "/images/landing/select-tti.webp",
    //   imgAlt: "AI Image Generation",
    //   badgeContent: {
    //     type: "new",
    //     icon: faSparkles,
    //     label: "NEW",
    //   },
    // },
    {
      to: "/style-video",
      title: t("productVideoStyleTransferTitle"),
      text: t("productVideoStyleTransferText"),
      videoSrc: "/videos/ai-tools/vst_video.mp4",
      videoPosterSrc: "/images/ai-tools/vst",
      imgAlt: "Video Style Transfer",
      badgeContent: {
        type: "new",
        icon: faSparkles,
        label: "NEW",
      },
    },

    {
      to: "/ai-live-portrait",
      title: t("productLivePortraitTitle"),
      text: t("productLivePortraitText"),
      videoSrc: "/videos/ai-tools/lp_video.mp4",
      videoPosterSrc: "/images/ai-tools/live_portrait",
      imgAlt: "Live Portrait",
      badgeContent: {
        type: "new",
        icon: faSparkles,
        label: "NEW",
      },
    },
    {
      to: "/face-animator",
      title: t("productLipsyncTitle"),
      text: t("productLipsyncText"),
      videoSrc: "/videos/ai-tools/ls_video.mp4",
      videoPosterSrc: "/images/ai-tools/lipsync",
      imgAlt: "Lipsync",
    },
    {
      to: "/webcam-acting",
      title: "Webcam Acting",
      text: "Act as your character through your camera",
      videoSrc: "/videos/ai-tools/ca_video.mp4",
      videoPosterSrc: "/images/ai-tools/webcam_acting",
      imgAlt: "Video Compositor",
    },
  ];

  const voiceProducts = [
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
      to: "/f5-tts",
      title: "F5-TTS Voice Cloning",
      text: "Zero-shot voice cloning",
      imgSrc: "/images/landing/select-f5-tts.webp",
      imgAlt: "Voice Cloning",
    },
    {
      to: "/seed-vc",
      title: "Seed-VC Voice Conversion",
      text: "Zero-shot voice conversion",
      imgSrc: "/images/landing/select-seed-vc.webp",
      imgAlt: "Zero-shot Voice Conversion",
    },
    {
      to: "/hallo2",
      title: "Hallo2 Portrait Animation",
      text: "High-res, long-duration and audio-driven",
      imgSrc: "/images/landing/select-hallo2.webp",
      imgAlt: "High-resolution, long-duration and audio-driven",
    },
    {
      to: "/cogvideo",
      title: "CogVideo Generation",
      text: "Text and image to video generation",
      imgSrc: "/images/landing/select-cogvideo.webp",
      imgAlt: "Text and image to video generation",
    },
  ];

  const storytellerLink =
    GetWebsite().website === Website.FakeYou
      ? WEBSITE.storyteller.link
      : WEBSITE.storyteller_studio.link;

  return (
    <Container type="panel">
      <Panel clear={true} className="mt-5">
        <div className="mb-4">
          <h1 className="fw-bold mb-1 d-flex align-items-center">
            <FontAwesomeIcon icon={faScrewdriverWrench} className="me-3 fs-2" />
            Creator Tools
          </h1>
          <h5 className="opacity-75">
            AI-powered tools for video and voice creation.
          </h5>
        </div>

        <div className="d-flex flex-column gap-5">
          <div>
            <h2 className="fw-bold mb-3 mt-4">Video</h2>
            <AIToolsRow items={videoProducts} />
          </div>
          <div>
            <h2 className="fw-bold mb-3 mt-4">Voice & Audio</h2>
            <AIToolsRow items={voiceProducts} />
          </div>
          <div>
            <h2 className="fw-bold mb-3 mt-4">
              High-Fidelity, Controllable Video Generation
            </h2>
            <Panel padding={true} className="p-3 p-lg-4 rounded">
              <div className="row g-3 g-lg-4">
                <div className="col-6 col-lg-3">
                  <div className="w-100 h-100 rounded overflow-hidden">
                    <img
                      src="https://storage.googleapis.com/vocodes-public/media/f/0/g/9/c/f0g9c1pqpa10hf6hbd3j8m7yzn8njh58/storyteller_f0g9c1pqpa10hf6hbd3j8m7yzn8njh58.mp4-thumb.gif"
                      alt="Fox Video"
                      className="w-100 object-fit-cover"
                    />
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="w-100 h-100 rounded overflow-hidden">
                    <img
                      src="https://storage.googleapis.com/vocodes-public/media/0/r/n/v/w/0rnvwqf7g7chkp3v4vnq5mgp0b2gpqcq/storyteller_0rnvwqf7g7chkp3v4vnq5mgp0b2gpqcq.mp4-thumb.gif"
                      alt="Dinosaur Video"
                      className="w-100 object-fit-cover"
                    />
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="w-100 h-100 rounded overflow-hidden">
                    <img
                      src="https://storage.googleapis.com/vocodes-public/media/8/s/a/k/x/8sakxqt1gtg4vanccf56ca7w9ez6bxr2/storyteller_8sakxqt1gtg4vanccf56ca7w9ez6bxr2.mp4-thumb.gif"
                      alt="Girl Video"
                      className="w-100 object-fit-cover"
                    />
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="w-100 h-100 rounded overflow-hidden">
                    <img
                      src="https://storage.googleapis.com/vocodes-public/media/q/a/4/y/5/qa4y5dphdfvca3yqszp5wsqz5bzsce1n/videoqa4y5dphdfvca3yqszp5wsqz5bzsce1nmp4-thumb.gif"
                      alt="Portal Video"
                      className="w-100 object-fit-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex flex-column gap-3 flex-lg-row align-items-start align-items-lg-center mt-5">
                <div className="flex-grow-1">
                  <h1 className="fw-bold mb-2 display-5">Storyteller Studio</h1>
                  <h5 className="fw-normal opacity-75">
                    Easily create your own movie in any style with our AI 3D
                    Engine.
                  </h5>
                </div>

                <Button
                  label="Enter Storyteller Studio"
                  icon={faPortalEnter}
                  className="enter-storyteller-button"
                  href={storytellerLink}
                />
              </div>
            </Panel>
          </div>
        </div>
      </Panel>
    </Container>
  );
}
