import { Button } from "components/common";
import React, { useEffect } from "react";

interface LandingVideoReelProps {}

export default function LandingVideoReel(props: LandingVideoReelProps) {
  const isOnLandingPage = window.location.pathname === "/";

  useEffect(() => {
    const contentWrapper = document.getElementById("page-content-wrapper");
    const topBarWrapper = document.getElementById("topbar-wrapper");

    const handleScroll = () => {
      if (window.scrollY > 100) {
        topBarWrapper?.classList.remove("topbar-wrapper-transparent");
      } else {
        topBarWrapper?.classList.add("topbar-wrapper-transparent");
      }
    };

    if (isOnLandingPage) {
      contentWrapper?.classList.add("no-page-padding-top");
      topBarWrapper?.classList.add("topbar-wrapper-transparent");
      window.addEventListener("scroll", handleScroll);
    } else {
      contentWrapper?.classList.remove("no-page-padding-top");
      topBarWrapper?.classList.remove("topbar-wrapper-transparent");
      window.removeEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      topBarWrapper?.classList.remove("topbar-wrapper-transparent");
      contentWrapper?.classList.remove("no-page-padding-top");
    };
  }, [isOnLandingPage]);

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center">
      <video
        autoPlay
        muted
        loop
        className="position-absolute w-100 h-100"
        style={{ objectFit: "cover", zIndex: -1 }}
      >
        <source src="path/to/your/video.mp4" type="video/mp4" />
      </video>
      <div className="text-center text-white d-flex flex-column align-items-center">
        <h1 className="display-2 fw-bolder">Visuals and Audio with AI</h1>
        <h5 className="fw-normal mb-3 mt-2 w-75 lh-base opacity-75">
          We are combining generative AI and User Generated Content to radically
          democratize both audio and video production.
        </h5>
        <Button label="Sign Up Now" to="/signup" className="mt-5" />
      </div>
    </div>
  );
}
