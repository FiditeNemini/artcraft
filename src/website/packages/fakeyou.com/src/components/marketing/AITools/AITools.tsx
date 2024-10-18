import React from "react";
import { faFlask, faSparkles } from "@fortawesome/pro-solid-svg-icons";
import { useLocalize } from "hooks";
import AIToolsRow from "./AIToolsRow";
import { useLocation } from "react-router-dom";

export default function AITools() {
  const { t } = useLocalize("LandingPage");
  const location = useLocation();
  const currentPath = location.pathname;

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

  let items: Item[] = [
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
    // {
    //   to: "/beta/2d-video-compositor",
    //   title: "2D Video Compositor",
    //   text: "Compose videos and images with AI",
    //   videoSrc: "/videos/ai-tools/vcomp_video_2.mp4",
    //   videoPosterSrc: "/images/ai-tools/2d_vid_com",
    //   imgAlt: "Video Compositor",
    //   videoPosition: "top",
    // },
    // {
    //   to: "/beta/3d-video-compositor",
    //   title: "3D Video Compositor",
    //   text: "Build videos with AI 3D engine",
    //   videoSrc: "/videos/ai-tools/vcomp_video.mp4",
    //   videoPosterSrc: "/images/ai-tools/3d_vid_com",
    //   imgAlt: "Video Compositor",
    // },
    {
      to: "/webcam-acting",
      title: "Webcam Acting",
      text: "Act as your character through your camera",
      videoSrc: "/videos/ai-tools/ca_video.mp4",
      videoPosterSrc: "/images/ai-tools/webcam_acting",
      imgAlt: "Video Compositor",
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
      to: "/f5-tts",
      title: "F5-TTS Voice Cloning",
      text: "Zero-shot voice cloning",
      imgSrc: "/images/landing/select-f5-tts.webp",
      imgAlt: "Voice Cloning",
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

  if (
    currentPath.includes("/style-video") ||
    currentPath.includes("/ai-face-mirror") ||
    currentPath.includes("/ai-live-portrait") ||
    currentPath.includes("/voice-conversion") ||
    currentPath.includes("/tts") ||
    currentPath.includes("/live-portrait") ||
    currentPath.includes("/dev-lp") ||
    currentPath.includes("/beta/") ||
    currentPath.includes("/face-animator")
  ) {
    items.push({
      externalLink: "https://discord.gg/fakeyou",
      title: "Join Our Discord",
      text: "Be a part of our community",
      imgSrc: "/images/landing/select-discord.webp",
      imgAlt: "Discord Link",
    });
  }

  // Test Page
  // if (currentPath.includes("/dev/tools")) {
  //   items.push(
  //     {
  //       to: "/",
  //       title: "2D Video Compositor",
  //       text: "Compose videos and images with AI",
  //       videoSrc: "/videos/ai-tools/vcomp_video.mp4",
  //       videoPosterSrc: "/images/ai-tools/vcomp_video_poster.jpg",
  //       imgAlt: "Video Compositor",
  //     },
  //     {
  //       to: "/",
  //       title: "3D Video Compositor",
  //       text: "Compose videos and images with AI",
  //       videoSrc: "/videos/ai-tools/vcomp_video_2.mp4",
  //       videoPosterSrc: "/images/ai-tools/vcomp_video_poster_2.jpg",
  //       imgAlt: "Video Compositor",
  //       videoPosition: "top",
  //     },
  //     {
  //       to: "/",
  //       title: "Webcam Acting",
  //       text: "Act as your character through your camera",
  //       videoSrc: "/videos/ai-tools/ca_video.mp4",
  //       videoPosterSrc: "/images/ai-tools/ca_video_poster.jpg",
  //       imgAlt: "Video Compositor",
  //     }
  //   );
  //   items = items.filter(
  //     item =>
  //       item.to !== "/tts" &&
  //       item.to !== "/voice-conversion" &&
  //       item.to !== "/voice-designer"
  //   );
  // }

  if (currentPath.includes("/tts")) {
    items = items.filter(item => item.to !== "/tts");
  }

  if (currentPath.includes("/voice-conversion")) {
    items = items.filter(item => item.to !== "/voice-conversion");
  }

  if (currentPath.includes("/beta/")) {
    items = items.filter(
      item =>
        item.to !== "/tts" &&
        item.to !== "/voice-conversion" &&
        item.to !== "/voice-designer" &&
        item.to !== "/face-animator" &&
        item.to !== "/beta/2d-video-compositor" &&
        item.to !== "/beta/3d-video-compositor" &&
        item.to !== "/beta/webcam-acting"
    );
  }

  if (currentPath.includes("/tts")) {
    items = [items[0], items[1], items[2], items[3], items[4], items[5]];
  }

  if (currentPath.includes("/voice-conversion")) {
    items = [items[0], items[1], items[2], items[3], items[4], items[5]];
  }

  if (currentPath.includes("/f5-tts")) {
    items = [items[0], items[1], items[2], items[3], items[4], items[5]];
  }

  if (currentPath.includes("/style-video")) {
    items = [items[1], items[2], items[8]];
  }

  if (currentPath.includes("/face-animator")) {
    items = [items[0], items[1], items[8]];
  }

  if (currentPath.includes("/webcam-acting")) {
    items = [items[0], items[1], items[8]];
  }

  if (
    currentPath.includes("/ai-live-portrait") ||
    currentPath.includes("/ai-face-mirror") ||
    currentPath.includes("/live-portrait") ||
    currentPath.includes("/dev-lp")
  ) {
    items = [items[0], items[2], items[8]];
  }

  return <AIToolsRow {...{ items }} />;
}
