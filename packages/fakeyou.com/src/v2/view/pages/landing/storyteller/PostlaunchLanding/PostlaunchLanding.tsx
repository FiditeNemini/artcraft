import {
  Website,
  WebsiteConfig,
} from "@storyteller/components/src/env/GetWebsite";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { Button } from "components/common";
import { useDomainConfig } from "context/DomainConfigContext";
import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import FeatureTitle from "./FeatureTitle";
import { Animate, BuildScene, GenerateMovie, SelectStyle } from "./FeatureCard";
import {
  faArrowRight,
  faCube,
  faFilm,
  faPaintbrushPencil,
  faPersonRunning,
} from "@fortawesome/pro-solid-svg-icons";
import ScrollingSceneCarousel from "./ScrollingSceneCarousel";
import EmailSignUp from "./EmailSignUp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface PostlaunchLandingProps {
  sessionWrapper: SessionWrapper;
}

export default function PostlaunchLanding(props: PostlaunchLandingProps) {
  const [imageHeight, setImageHeight] = useState("100vh");
  const domain: WebsiteConfig = useDomainConfig();

  const webpageTitle =
    domain.website === Website.FakeYou
      ? "FakeYou Celebrity Voice Generator"
      : "AI Creation Engine";

  usePrefixedDocumentTitle(webpageTitle);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 992);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const updateImageSize = () => {
      const headerHeight =
        document.querySelector(".header-container")?.clientHeight || 0;
      const topPadding = 20;
      const bottomPadding = 50;
      const windowHeight = window.innerHeight;
      const availableHeight =
        windowHeight - headerHeight - topPadding - bottomPadding;
      setImageHeight(`${availableHeight}px`);
    };

    window.addEventListener("resize", updateImageSize);

    updateImageSize();

    return () => window.removeEventListener("resize", updateImageSize);
  }, []);

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerHeight > 1000);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerHeight > 1000);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let scaleFactor;
  if (isSmallScreen) {
    scaleFactor = 3.5;
  } else {
    scaleFactor = 4.5;
  }

  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const scaleFull = useTransform(scrollYProgress, [0, 1], [1, scaleFactor]);
  const opacityLaptop = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const opacityTitle = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const opacityOverlay = useTransform(scrollYProgress, [0.6, 1], [0, 1]);

  const ctaButton = props.sessionWrapper.canAccessStudio() ? (
    <div className="d-flex">
      <Button
        label="Enter Storyteller Studio"
        className="mt-4"
        fontLarge={true}
        icon={faArrowRight}
        iconFlip={true}
        href="https://studio.storyteller.ai/"
      />
    </div>
  ) : (
    <div className="d-flex">
      <Button
        label="Join the Waitlist"
        className="mt-4"
        fontLarge={true}
        icon={faArrowRight}
        iconFlip={true}
        href="https://7mjlxvmjq8u.typeform.com/to/ZQTkv9ha"
      />
    </div>
  );

  return (
    <>
      {isMobile ? (
        // MOBILE VIEW
        <div className="container">
          <div
            className="header-container text-center d-flex flex-column align-items-center justify-content-center mb-5"
            style={{ paddingTop: "80px" }}
          >
            <h1 className="display-1 fw-bold mt-4">{firstTitle}</h1>
            <p className="lead fw-medium fs-4 opacity-75">{firstSubtext}</p>
            {ctaButton}
          </div>
          <div
            className="d-flex justify-content-center align-items-center position-relative"
            style={{
              width: "100%",
              zIndex: 10,
            }}
          >
            <video
              src="/videos/landing/hero_video.mp4"
              preload="metadata"
              style={{
                width: "100%",
                maxWidth: "900px",
                borderRadius: "0.75rem",
                overflow: "hidden",
                border: "2px solid rgba(255, 255, 255, 0.1)",
              }}
              autoPlay={true}
              controls={false}
              muted={true}
              loop={true}
              playsInline={true}
            />
          </div>

          <div style={{ marginTop: "60px", marginBottom: "60px" }}>
            <ScrollingSceneCarousel small={true} />
          </div>

          <div
            className="container d-flex flex-column text-center justify-content-center align-items-center w-100"
            style={{ marginBottom: "70px" }}
          >
            <div className="d-flex flex-column align-items-center">
              <h2 className="display-4 fw-bold mt-4">{secondTitle}</h2>
              <p className="lead fw-normal fs-5 opacity-75">{secondSubtext}</p>
              {ctaButton}
            </div>
          </div>

          <div className="container d-flex flex-column gap-5">
            {features.map(feature => (
              <li key={feature.id} className="list-unstyled d-flex flex-column">
                <video
                  src={feature.video}
                  className="object-fit-contain w-100 h-100 mb-4"
                  preload="metadata"
                  muted={true}
                  autoPlay={true}
                  controls={false}
                  loop={true}
                  playsInline={true}
                  style={{ borderRadius: "1rem" }}
                />
                <h2 className="fs-2 fw-bold mb-3">
                  <FontAwesomeIcon icon={feature.icon} className="me-3" />
                  {feature.title}
                </h2>
                <p className="opacity-75 mb-5">{feature.description}</p>
              </li>
            ))}
          </div>

          <div
            className="container d-flex flex-column align-items-center"
            style={{ marginTop: "60px" }}
          >
            <h1 className="display-5 fw-bold">Showcase</h1>
            <p className="lead text-center fw-medium opacity-75 fs-5 mb-5">
              Videos created with Storyteller Studio.
            </p>
            <video
              src="/videos/landing/landing_reel.mp4"
              poster="/images/landing/storyteller/Landing_Reel_Poster.png"
              preload="metadata"
              style={{
                width: "100%",
                maxWidth: "900px",
                borderRadius: "0.75rem",
                overflow: "hidden",
                border: "2px solid rgba(255, 255, 255, 0.1)",
              }}
              autoPlay={true}
              controls={false}
              muted={true}
              loop={true}
              playsInline={true}
            />
            {props.sessionWrapper.isLoggedIn() && ctaButton}
          </div>

          {!props.sessionWrapper.canAccessStudio() ? (
            <div style={{ marginTop: "100px" }}>
              <EmailSignUp mobile={true} />
            </div>
          ) : null}
        </div>
      ) : (
        // DESKTOP VIEW
        <div>
          <div
            ref={container}
            style={{
              height: "150vh",
              position: "relative",
            }}
          >
            <div
              className="vh-100 w-100"
              style={{ position: "sticky", top: 0, overflow: "hidden" }}
            >
              <motion.div
                className="header-container text-center d-flex flex-column align-items-center justify-content-center"
                style={{ paddingTop: "50px", opacity: opacityTitle }}
              >
                <h1 className="display-1 fw-bold mt-4">{firstTitle}</h1>
                <p className="lead fw-medium fs-4 opacity-75">{firstSubtext}</p>
                {ctaButton}
              </motion.div>
              <div
                style={{
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "32px 0",
                }}
              >
                <motion.div
                  className="d-flex justify-content-center align-items-center position-relative"
                  style={{
                    width: "100%",
                    maxHeight: imageHeight,
                    scale: scaleFull,
                    zIndex: 10,
                  }}
                >
                  <video
                    src="/videos/landing/hero_video.mp4"
                    className="position-absolute"
                    preload="metadata"
                    style={{
                      height: "52%",
                      top: "20.55%",
                      zIndex: 10,
                      borderRadius: "0.25rem",
                    }}
                    autoPlay={true}
                    controls={false}
                    muted={true}
                    loop={true}
                    playsInline={true}
                  />
                  <motion.div
                    className="position-absolute"
                    style={{
                      width: "40%",
                      height: "52%",
                      top: "20.55%",
                      zIndex: 11,
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      opacity: opacityOverlay,
                      borderRadius: "0.25rem",
                    }}
                  />
                  <motion.img
                    src="/images/landing/storyteller/Laptop_Storyteller_2.png"
                    alt="Laptop"
                    style={{
                      maxHeight: imageHeight,
                      objectFit: "contain",
                      width: "auto",
                      opacity: opacityLaptop,
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  />
                </motion.div>
              </div>
            </div>
            <div
              className="position-absolute w-100"
              style={{ bottom: isSmallScreen ? "240px" : "150px" }}
            >
              <div className="d-flex flex-column justify-content-center align-items-center w-100">
                <div>
                  <h2
                    className="display-4 fw-bold mt-4"
                    style={{ textShadow: "2px 2px 10px rgba(0, 0, 0, 0.3)" }}
                  >
                    {secondTitle}
                  </h2>
                  <p
                    className="lead fw-medium fs-5 opacity-75"
                    style={{ textShadow: "2px 2px 10px rgba(0, 0, 0, 0.3)" }}
                  >
                    {secondSubtext}
                  </p>
                  {ctaButton}
                </div>
              </div>
            </div>
          </div>

          {/* SCENE CAROUSEL SECTION */}
          <ScrollingSceneCarousel />

          <div className="container">
            <div className="text-center">
              <h1 className="fw-bold display-4" style={{ marginTop: "140px" }}>
                {thirdTitle}
              </h1>
              <p
                className="lead fw-medium opacity-75 fs-4"
                style={{ marginBottom: !isSmallScreen ? "-10%" : "-22%" }}
              >
                {thirdSubtext}
              </p>
            </div>
            <div
              className="d-flex w-100 align-items-start"
              style={{ gap: "40px" }}
            >
              <div className="w-100">
                <ul
                  className="list-unstyled"
                  style={{ paddingTop: "50vh", paddingBottom: "33vh" }}
                >
                  {features.map(feature => (
                    <li key={feature.id}>
                      <FeatureTitle
                        id={feature.id}
                        title={feature.title}
                        icon={feature.icon}
                        description={feature.description}
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="w-100 position-sticky top-0 d-flex align-items-center justify-content-center"
                style={{ height: "100vh", marginTop: "120px" }}
              >
                <div
                  className="ratio ratio-1x1"
                  style={{
                    width: !isSmallScreen ? "600px" : "650px",
                    backgroundColor: "#242433",
                    borderRadius: "1rem",
                  }}
                >
                  {features.map(feature => (
                    <feature.card id={feature.id} key={feature.id} />
                  ))}
                </div>
              </div>
            </div>

            <div
              className="container d-flex flex-column align-items-center"
              style={{ marginTop: "-50px" }}
            >
              <h1 className="display-5 fw-bold">Showcase</h1>
              <p className="lead fw-medium opacity-75 fs-4 mb-5">
                Videos created with Storyteller Studio.
              </p>
              <video
                src="/videos/landing/landing_reel.mp4"
                poster="/images/landing/storyteller/Landing_Reel_Poster.png"
                preload="metadata"
                style={{
                  width: "100%",
                  maxWidth: "900px",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  border: "2px solid rgba(255, 255, 255, 0.1)",
                }}
                autoPlay={true}
                controls={false}
                muted={true}
                loop={true}
                playsInline={true}
              />
              {props.sessionWrapper.isLoggedIn() && ctaButton}
            </div>

            {!props.sessionWrapper.canAccessStudio() ? (
              <div style={{ marginTop: "260px" }}>
                <EmailSignUp />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

const firstTitle = "Control Your Movie";
const firstSubtext =
  "Effortlessly create your movie in any style you want with AI.";
const secondTitle = "Your AI 3D Creation Engine";
const secondSubtext =
  "Turn your creative ideas into stunning visuals, by simply building a 3D scene and generate.";
const thirdTitle = "Filmmaking Made Easy";
const thirdSubtext = "Just a few simple steps to creating your movie.";

const features = [
  {
    title: "Build your 3D scene",
    icon: faCube,
    description:
      " Storyteller Studio allows you to create and customize your 3D environment. Add characters, objects, and fine-tune details to craft the perfect scene for your movie.",
    id: "build-scene",
    card: BuildScene,
    video: "/videos/landing/build_scene.mp4",
  },
  {
    title: "Animate your scene",
    icon: faPersonRunning,
    description:
      "Bring your scene to life by adding animations to your characters and objects. Control movements to create dynamic visuals that engage your audience.",
    id: "animate-scene",
    card: Animate,
    video: "/videos/landing/animate_scene.mp4",
  },
  {
    title: "Select a style",
    icon: faPaintbrushPencil,
    description:
      "Choose from a variety of artistic styles to transform your 3D scene. Whether you prefer a realistic look or a more abstract approach, our AI can apply the style seamlessly.",
    id: "select-style",
    card: SelectStyle,
    video: "/videos/landing/select_style.mp4",
  },
  {
    title: "Generate your movie",
    icon: faFilm,
    description:
      "Let Storyteller Studio's AI process your scene and selected style to produce a stunning video. Sit back and watch as your 3D creation comes to life with the chosen visual art style.",
    id: "generate-movie",
    card: GenerateMovie,
    video: "/videos/landing/generate_movie.mp4",
  },
];
