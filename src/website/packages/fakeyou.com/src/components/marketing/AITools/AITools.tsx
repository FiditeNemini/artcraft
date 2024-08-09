import React from "react";
import { faFlask, faSparkles } from "@fortawesome/pro-solid-svg-icons";
import { useLocalize } from "hooks";
import AIToolsRow from "./AIToolsRow";
import { useLocation } from "react-router-dom";

export default function AITools() {
  const { t } = useLocalize("LandingPage");
  const location = useLocation();
  const currentPath = location.pathname;

  let items = [
    {
      to: "/style-video",
      title: t("productVideoStyleTransferTitle"),
      text: t("productVideoStyleTransferText"),
      videoSrc: "/videos/ai-tools/vst_video.mp4",
      videoPosterSrc: "/images/ai-tools/vst_video_poster.jpg",
      imgAlt: "Video Style Transfer",
      badgeContent: {
        type: "new",
        icon: faSparkles,
        label: "NEW",
      },
    },
    {
      to: "/ai-face-mirror",
      title: t("productLivePortraitTitle"),
      text: t("productLivePortraitText"),
      videoSrc: "/videos/ai-tools/lp_video.mp4",
      videoPosterSrc: "/images/ai-tools/lp_video_poster.jpg",
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
      videoPosterSrc: "/images/ai-tools/ls_video_poster.jpg",
      imgAlt: "Lipsync",
    },
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
  ];

  if (currentPath === "/tts") {
    items = items.filter(item => item.to !== "/tts");
  }
  if (currentPath === "/voice-conversion") {
    items = items.filter(item => item.to !== "/voice-conversion");
  }

  if (currentPath === "/tts") {
    items = [items[0], items[1], items[2], items[3], items[4]];
  }

  if (currentPath === "/voice-conversion") {
    items = [items[0], items[1], items[2], items[3], items[4]];
  }

  return <AIToolsRow {...{ items }} />;
}
