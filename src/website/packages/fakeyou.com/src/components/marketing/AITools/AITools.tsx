import React from "react";
import { faFlask, faSparkles } from "@fortawesome/pro-solid-svg-icons";
import { useLocalize } from "hooks";
import AIToolsRow from "./AIToolsRow";

export default function AITools() {
  const { t } = useLocalize("LandingPage");
  const items = [
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
      title: t("productLipsyncTitle"),
      text: t("productLipsyncText"),
      imgSrc: "/images/landing/select-fa.webp",
      imgAlt: "Lipsync",
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
    {
      to: "/ai-face-mirror",
      title: t("productLivePortraitTitle"),
      text: t("productLivePortraitText"),
      imgSrc: "/images/landing/select-fm.webp",
      imgAlt: "Live Portrait",
      badgeContent: {
        type: "new",
        icon: faSparkles,
        label: "NEW",
      },
    },
  ];

  return <AIToolsRow {...{ items }} />;
}
