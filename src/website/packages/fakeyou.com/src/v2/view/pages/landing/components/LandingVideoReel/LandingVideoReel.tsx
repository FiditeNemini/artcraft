import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import { Button } from "components/common";
import React, { useEffect, useState } from "react";
import "./LandingVideoReel.scss";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useLocation } from "react-router-dom";

interface LandingVideoReelProps {
  sessionWrapper: SessionWrapper;
}

export default function LandingVideoReel({
  sessionWrapper,
}: LandingVideoReelProps) {
  const location = useLocation();
  const [isOnLandingPage, setIsOnLandingPage] = useState(
    window.location.pathname === "/"
  );
  const isLoggedIn = sessionWrapper.isLoggedIn();

  useEffect(() => {
    setIsOnLandingPage(location.pathname === "/");
  }, [location]);

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
  }, [isOnLandingPage, isLoggedIn]);

  return (
    <div className="storyteller-landing-reel">
      <video autoPlay muted loop controls={false} playsInline>
        <source src="/videos/landing-reel.mp4" type="video/mp4" />
      </video>
      <div className="reel-overlay">
        <div className="container h-100">
          <div className="text-center text-white d-flex flex-column justify-content-center align-items-center zi-2 h-100">
            <h1 className="storyteller-landing-heading fw-bold">
              Your Own Hollywood
            </h1>
            <h5 className="fw-normal mb-2 mt-1 lh-base opacity-75 storyteller-landing-sub-text">
              Directors know that you can't simply prompt a movie, which is why
              we've built something that uniquely captures the filmmaker's intent.
              Our platform is simple and reusable, a place where filmmaking can be
              fun again.
            </h5>
            <Button
              icon={faArrowRight}
              iconFlip={true}
              label={isLoggedIn ? "Explore AI Tools" : "Sign Up Now"}
              to={isLoggedIn ? "/dashboard" : "/signup"}
              className="mt-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
