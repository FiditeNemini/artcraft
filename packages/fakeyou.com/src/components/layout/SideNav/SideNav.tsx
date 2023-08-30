import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faBookOpen,
  faMessageDots,
  faTrophy,
  faVideo,
  faWaveformLines,
  faStar,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "components/common/Button/Button";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useRouteMatch } from "react-router-dom";

interface SideNavProps {}

export default function SideNav(props: SideNavProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleNavLinkClick = () => {
    const wrapper = document.getElementById("wrapper");

    if (window.innerWidth < 992) {
      if (wrapper) {
        wrapper.classList.toggle("toggled");
      }
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const wrapper = document.getElementById("wrapper");
      const overlay = document.getElementById("overlay");

      if (
        (!wrapper?.contains(event.target as Node) ||
          overlay?.contains(event.target as Node)) &&
        window.innerWidth < 992
      ) {
        wrapper?.classList.remove("toggled");
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const matchHome = useRouteMatch({
    path: "/",
    exact: true,
  });

  useEffect(() => {
    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup listener on unmount
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const shouldShowSidebar = windowWidth >= 992 && matchHome;

  useEffect(() => {
    const wrapper = document.getElementById("wrapper");

    if (windowWidth >= 992) {
      if (matchHome) {
        wrapper?.classList.add("no-padding");
      } else {
        wrapper?.classList.remove("no-padding");
      }
    }
  }, [matchHome, windowWidth]);

  return (
    <div
      id="sidebar-wrapper"
      className={`sidebar ${shouldShowSidebar ? "" : "visible"}`}
    >
      <ul className="sidebar-nav">
        <div className="sidebar-brand">
          <Link to="/">
            <img
              src="/fakeyou/FakeYou-Logo.png"
              alt="FakeYou: Cartoon and Celebrity Text to Speech"
              height="36"
            />
          </Link>
        </div>
        <div className="sidebar-buttons d-flex gap-2 mt-4">
          <Button label="Sign Up" small />
          <Button label="Login" small secondary />
        </div>
        <hr className="my-4" />

        <li className="sidebar-heading">Speech Generation</li>
        <li>
          <NavLink
            to="/tts"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon
              icon={faMessageDots}
              className="sidebar-heading-icon"
            />
            Text to Speech
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/voice-conversion"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon
              icon={faWaveformLines}
              className="sidebar-heading-icon"
            />
            Voice to Voice
          </NavLink>
        </li>
        <hr className="mb-4 mt-3" />
        <li className="sidebar-heading">Video Generation</li>
        <li>
          <NavLink
            to="/video"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon icon={faVideo} className="sidebar-heading-icon" />
            Video Lipsync
          </NavLink>
        </li>
        <hr className="mb-4 mt-3" />
        <li className="sidebar-heading">Community</li>
        <li>
          <a href="https://fakeyou.com">
            <FontAwesomeIcon
              icon={faDiscord}
              className="sidebar-heading-icon"
            />
            Discord
          </a>
          <a href="https://fakeyou.com">
            <FontAwesomeIcon icon={faTrophy} className="sidebar-heading-icon" />
            Leaderboard
          </a>
          <a href="https://fakeyou.com">
            <FontAwesomeIcon
              icon={faBookOpen}
              className="sidebar-heading-icon"
            />
            Guide
          </a>
        </li>
        <hr className="mb-3 mt-3" />
        <li>
          <NavLink
            to="/pricing"
            activeClassName="active-link"
            onClick={handleNavLinkClick}
          >
            <FontAwesomeIcon icon={faStar} className="sidebar-heading-icon" />
            Pricing
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
