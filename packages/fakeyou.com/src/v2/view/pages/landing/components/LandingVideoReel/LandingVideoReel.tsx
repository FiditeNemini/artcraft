import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import { Button } from "components/common";
import React, { useEffect } from "react";
import "./LandingVideoReel.scss";

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
    <div className="storyteller-landing-reel">
      <video autoPlay muted loop controls={false} playsInline>
        <source src="/videos/landing-reel.mp4" type="video/mp4" />
      </video>
      <div className="reel-overlay">
        <div className="container h-100">
          <div className="text-center text-white d-flex flex-column justify-content-center align-items-center zi-2 h-100">
            <h1 className="storyteller-landing-heading fw-bold">
              Enabling Anyone to Make Professional Film, Animation, and Music
            </h1>
            <h5 className="fw-normal mb-2 mt-2 lh-base opacity-75 storyteller-landing-sub-text">
              StorytellerAI's powerful new engine combines Generative AI and
              User Generated Content to radically democratize both audio and
              video production.
            </h5>
            <Button
              icon={faArrowRight}
              iconFlip={true}
              label="Sign Up Now"
              to="/signup"
              className="mt-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
