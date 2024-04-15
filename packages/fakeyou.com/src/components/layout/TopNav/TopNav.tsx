import {
  faBars,
  faFaceViewfinder,
  faMessageDots,
  faSearch,
  faStar,
  faWandMagicSparkles,
  faWaveformLines,
  faXmark,
  faClipboardList,
  faChevronLeft,
  faMessageImage,
} from "@fortawesome/pro-solid-svg-icons";
import { Button } from "components/common";
import SearchBar from "components/common/SearchBar";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Logout } from "@storyteller/components/src/api/session/Logout";
import { useModal, useSession } from "hooks";
import { InferenceJobsModal } from "components/modals";
import { useDomainConfig } from "context/DomainConfigContext";
import NavItem from "../../common/NavItem/NavItem";
import ProfileDropdown from "components/common/ProfileDropdown";
import "./TopNav.scss";

interface TopNavProps {
  sessionWrapper: SessionWrapper;
  logoutHandler: () => void;
  querySessionCallback: () => void;
  querySessionSubscriptionsCallback: () => void;
}

export default function TopNav({
  sessionWrapper,
  querySessionCallback,
  querySessionSubscriptionsCallback,
}: TopNavProps) {
  const domain = useDomainConfig();
  let history = useHistory();
  const [isMobileSearchBarVisible, setIsMobileSearchBarVisible] =
    useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapper = document.getElementById("wrapper");
  const [menuButtonIcon, setMenuButtonIcon] = useState(faBars);
  // const { t } = useLocalize("TopNav");
  const isOnLandingPage = window.location.pathname === "/";
  const isOnLoginPage = window.location.pathname.includes("/login");
  const isOnSignUpPage = window.location.pathname.includes("/signup");
  const isOnStudioPage = window.location.pathname.includes("/studio");

  const { open } = useModal();
  const openModal = () => open({ component: InferenceJobsModal });
  const [isScrolled, setIsScrolled] = useState(false);
  const loggedIn = sessionWrapper.isLoggedIn();
  const showNavItem =
    !loggedIn && (isOnLandingPage || isOnLoginPage || isOnSignUpPage);

  const handleMenuButtonClick = () => {
    if (window.innerWidth < 1200) {
      if (wrapper) {
        wrapper.classList.toggle("toggled");
        if (menuButtonIcon === faBars) {
          setMenuButtonIcon(faXmark);
        } else {
          setMenuButtonIcon(faBars);
        }
      }
    }
  };

  const handleSearchButtonClick = () => {
    setIsMobileSearchBarVisible(true);
    setMenuButtonIcon(faBars);
    if (window.innerWidth < 1200) {
      if (wrapper) {
        wrapper.classList.remove("toggled");
      }
    }
  };

  const onFocusHandler = () => {
    setIsFocused(true);
  };

  const onBlurHandler = () => {
    // Search field blur/Unfocusing hack: needs a little bit of delay for the result click event to register
    setTimeout(() => {
      setIsFocused(false);

      if (isMobileSearchBarVisible) {
        setIsMobileSearchBarVisible(false);
      }
    }, 100);
  };

  useEffect(() => {
    const topBarWrapper = document.getElementById("topbar-wrapper");

    const handleMenuToggle = (event: any) => {
      setMenuButtonIcon(event.detail.isOpen ? faXmark : faBars);
      if (event.detail.isOpen) {
        topBarWrapper?.classList.remove("topbar-wrapper-transparent");
      } else {
        topBarWrapper?.classList.add("topbar-wrapper-transparent");
      }
    };

    window.addEventListener("menuToggle", handleMenuToggle);

    return () => {
      window.removeEventListener("menuToggle", handleMenuToggle);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const logoutHandler = async () => {
    await Logout();
    querySessionCallback();
    querySessionSubscriptionsCallback();
    history.push("/");
  };

  let profileDropdown = <></>;

  const { user } = useSession();

  if (sessionWrapper.isLoggedIn()) {
    let displayName = user.display_name;
    let username = user.username;
    let emailHash = user.email_gravatar_hash;
    let avatarIndex = user.core_info.default_avatar.image_index;
    let backgroundColorIndex = user.core_info.default_avatar.color_index;

    profileDropdown = (
      <ProfileDropdown
        username={username || ""}
        displayName={displayName || ""}
        avatarIndex={avatarIndex}
        backgroundColorIndex={backgroundColorIndex}
        emailHash={emailHash || ""}
        logoutHandler={logoutHandler}
      />
    );
  }

  const aiToolsDropdown = [
    { id: 1, name: "Text to Speech", link: "/tts", icon: faMessageDots },
    {
      id: 2,
      name: "Voice to Voice",
      link: "/voice-conversion",
      icon: faWaveformLines,
    },
    {
      id: 3,
      name: "Face Animator",
      link: "/face-animator",
      icon: faFaceViewfinder,
    },
    {
      id: 4,
      name: "Voice Designer",
      link: "/voice-designer",
      icon: faWandMagicSparkles,
    },
    {
      id: 5,
      name: "Text to Image",
      link: "/text-to-image",
      icon: faMessageImage,
    },
    // { id: 4, name: "Text to Image", link: "/text-to-image" },
  ];

  return (
    <div
      id="topbar-wrapper"
      className={`position-fixed ${
        domain.titlePart !== "FakeYou"
          ? "topbar-bg-transparent"
          : !loggedIn && isOnLandingPage && !isScrolled
            ? "topbar-bg-dark"
            : ""
      }`.trim()}
    >
      <div className="topbar-nav">
        <div className="topbar-nav-left">
          <div className="d-flex gap-3 align-items-center">
            <Link to="/">
              <img
                src={domain.logo}
                alt={`${domain.titlePart}: Cartoon and Celebrity Text to Speech`}
                height="36"
                className="mb-1 d-none d-lg-block"
              />
              <img
                src="/fakeyou/FakeYou-Logo-Mobile.png"
                alt={`${domain.titlePart}: Cartoon and Celebrity Text to Speech`}
                height="36"
                className="mb-0 d-block d-lg-none"
              />
            </Link>
            {showNavItem && (
              <div className="d-none d-lg-block">
                <NavItem
                  isHoverable={true}
                  label="AI Tools"
                  dropdownItems={aiToolsDropdown}
                />
              </div>
            )}
            {isOnStudioPage && loggedIn && (
              <Button
                icon={faChevronLeft}
                label="Back to Dashboard"
                small={true}
                variant="secondary"
                to="/"
                className="ms-2"
              />
            )}
          </div>
        </div>

        <div className="topbar-nav-center">
          {/* Search Bar */}
          <div className="d-none d-lg-block">
            {(!isOnLandingPage &&
              !isOnLoginPage &&
              !isOnSignUpPage &&
              !isOnStudioPage) ||
            (loggedIn &&
              !isOnLoginPage &&
              !isOnSignUpPage &&
              !isOnStudioPage) ||
            (isOnLandingPage &&
              isScrolled &&
              !isOnLoginPage &&
              !isOnSignUpPage &&
              !isOnStudioPage) ? (
              <SearchBar
                onFocus={onFocusHandler}
                onBlur={onBlurHandler}
                isFocused={isFocused}
              />
            ) : null}
          </div>
        </div>

        <div className="topbar-nav-right">
          {showNavItem && (
            <NavItem
              icon={faStar}
              label="Pricing"
              link="/pricing"
              className="me-3 d-none d-lg-block"
            />
          )}

          <div className="d-flex align-items-center gap-2">
            <div className="d-none d-lg-flex gap-2">
              {!showNavItem && (
                <Button
                  {...{
                    icon: faClipboardList,
                    label: "My Jobs",
                    onClick: openModal,
                    variant: "secondary",
                    small: true,
                  }}
                />
              )}

              {loggedIn ? (
                profileDropdown
              ) : (
                <>
                  <Button
                    label="Login"
                    small
                    variant="secondary"
                    onClick={() => {
                      history.push("/login");
                    }}
                  />
                  <Button
                    label="Sign Up"
                    small
                    onClick={() => {
                      history.push("/signup");
                    }}
                  />
                </>
              )}
            </div>
            {!showNavItem && (
              <>
                <Button
                  icon={faClipboardList}
                  variant="secondary"
                  small={true}
                  label="My Jobs"
                  onClick={openModal}
                  className="d-lg-none"
                />
                <Button
                  icon={faSearch}
                  variant="secondary"
                  small={true}
                  square={true}
                  onClick={handleSearchButtonClick}
                  className="d-lg-none"
                />
              </>
            )}

            <Button
              icon={menuButtonIcon}
              variant="secondary"
              small={true}
              square={true}
              onClick={handleMenuButtonClick}
              className="d-lg-none"
            />
          </div>
        </div>
      </div>

      {/* <div className="topbar-nav bg-panel">test</div> */}

      {/* Mobile Searchbar */}
      {isMobileSearchBarVisible && (
        <div className="topbar-mobile-search-bar-container">
          <div className="topbar-mobile-search-bar">
            <SearchBar
              onFocus={onFocusHandler}
              onBlur={onBlurHandler}
              isFocused={isFocused}
              autoFocus={true}
            />

            <Button
              icon={faXmark}
              className="close-search-button"
              onClick={() => {
                setIsMobileSearchBarVisible(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
