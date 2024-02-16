import { Button } from "components/common";
import React, { useEffect } from "react";

interface LandingVideoReelProps {}

export default function LandingVideoReel(props: LandingVideoReelProps) {
  const isOnLandingPage = window.location.pathname === "/";

  useEffect(() => {
    const contentWrapper = document.getElementById("page-content-wrapper");
    const topBarWrapper = document.getElementById("topbar-wrapper");
    const searchBar = document.querySelector(".search-field .form-control");

    const handleScroll = () => {
      if (window.scrollY > 100) {
        topBarWrapper?.classList.remove("topbar-wrapper-transparent");
        searchBar?.classList.remove("landing-search");
      } else {
        topBarWrapper?.classList.add("topbar-wrapper-transparent");
        searchBar?.classList.add("landing-search");
      }
    };

    if (isOnLandingPage) {
      contentWrapper?.classList.add("no-page-padding-top");
      topBarWrapper?.classList.add("topbar-wrapper-transparent");
      searchBar?.classList.add("landing-search");
      window.addEventListener("scroll", handleScroll);
    } else {
      contentWrapper?.classList.remove("no-page-padding-top");
      topBarWrapper?.classList.remove("topbar-wrapper-transparent");
      searchBar?.classList.remove("landing-search");
      window.removeEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      topBarWrapper?.classList.remove("topbar-wrapper-transparent");
      searchBar?.classList.remove("landing-search");
      contentWrapper?.classList.remove("no-page-padding-top");
    };
  }, [isOnLandingPage]);

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center position-relative">
      <video
        autoPlay
        muted
        loop
        className="position-absolute w-100 h-100"
        style={{ objectFit: "cover" }}
      >
        <source src="/videos/landing-reel.mp4" type="video/mp4" />
      </video>
      <div
        className="position-absolute w-100 h-100"
        style={{ backgroundColor: "rgba(20, 20, 27, 0.6)", zIndex: 0 }}
      />
      <div className="text-center text-white d-flex flex-column align-items-center zi-2">
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
