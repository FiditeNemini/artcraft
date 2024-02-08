import {
  faBars,
  faFaceViewfinder,
  faMessageDots,
  faSearch,
  faSignOutAlt,
  faStar,
  faUser,
  faWandMagicSparkles,
  faWaveformLines,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import { Button } from "components/common";
import SearchBar from "components/common/SearchBar";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { WebUrl } from "common/WebUrl";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Logout } from "@storyteller/components/src/api/session/Logout";
import { useDomainConfig } from "context/DomainConfigContext";
import NavItem from "../../common/NavItem/NavItem";

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
  const isOnLoginOrSignUpPage =
    window.location.pathname === "/login" ||
    window.location.pathname === "/login/" ||
    window.location.pathname === "/signup" ||
    window.location.pathname === "/signup/";

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
    const handleMenuToggle = (event: any) => {
      setMenuButtonIcon(event.detail.isOpen ? faXmark : faBars);
    };

    window.addEventListener("menuToggle", handleMenuToggle);

    return () => {
      window.removeEventListener("menuToggle", handleMenuToggle);
    };
  }, []);

  const logoutHandler = async () => {
    await Logout();
    querySessionCallback();
    querySessionSubscriptionsCallback();
    // PosthogClient.reset();
    // Analytics.accountLogout();
    history.push("/");
  };

  const loggedIn = sessionWrapper.isLoggedIn();

  let userOrLoginButton = (
    <>
      <Button
        label="Login"
        small
        variant="secondary"
        onClick={() => {
          history.push("/login");
        }}
      />
    </>
  );

  let signupOrLogOutButton = (
    <>
      <Button
        label="Sign Up"
        small
        onClick={() => {
          history.push("/signup");
        }}
      />
    </>
  );

  if (loggedIn) {
    let displayName = sessionWrapper.getDisplayName();
    // let gravatarHash = props.sessionWrapper.getEmailGravatarHash();
    // let gravatar = <span />;

    if (displayName === undefined) {
      displayName = "My Account";
    }

    let url = WebUrl.userProfilePage(displayName);
    userOrLoginButton = (
      <>
        <Button
          icon={faUser}
          label="My Profile"
          small
          variant="secondary"
          onClick={() => {
            history.push(url);
          }}
        />
      </>
    );

    signupOrLogOutButton = (
      <>
        <Button
          icon={faSignOutAlt}
          label="Logout"
          small
          variant="danger"
          onClick={async () => {
            await logoutHandler();
          }}
        />
      </>
    );
  }

  if (sessionWrapper.isLoggedIn()) {
    let displayName = sessionWrapper.getDisplayName();
    if (displayName === undefined) {
      displayName = "My Account";
    }
    let url = WebUrl.userProfilePage(displayName);
    userOrLoginButton = (
      <Button
        icon={faUser}
        label="My Profile"
        small
        variant="secondary"
        onClick={() => history.push(url)}
        className="d-none d-lg-block"
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
    // { id: 4, name: "Text to Image", link: "/text-to-image" },
  ];

  return (
    <div id="topbar-wrapper" className="position-fixed">
      <div className="topbar-nav">
        <div className="topbar-nav-left">
          <div className="d-flex gap-3 align-items-center">
            <Link to="/">
              <img
                src={domain.logo}
                alt={`${domain.title}: Cartoon and Celebrity Text to Speech`}
                height="34"
                className="mb-1 d-none d-lg-block"
              />
              <img
                src="/fakeyou/FakeYou-Logo-Mobile.png"
                alt={`${domain.title}: Cartoon and Celebrity Text to Speech`}
                height="36"
                className="mb-0 d-block d-lg-none"
              />
            </Link>
            {((!loggedIn && isOnLandingPage) ||
              (!loggedIn && isOnLoginOrSignUpPage)) && (
              <div className="d-none d-lg-block">
                <NavItem
                  isHoverable={true}
                  label="AI Tools"
                  dropdownItems={aiToolsDropdown}
                />
              </div>
            )}
          </div>
        </div>

        <div className="topbar-nav-center">
          {/* Search Bar */}
          <div className="d-none d-lg-block">
            <SearchBar
              onFocus={onFocusHandler}
              onBlur={onBlurHandler}
              isFocused={isFocused}
            />
          </div>
        </div>

        <div className="topbar-nav-right">
          {((!loggedIn && isOnLandingPage) ||
            (!loggedIn && isOnLoginOrSignUpPage)) && (
            <NavItem
              icon={faStar}
              label="Pricing"
              link="/pricing"
              className="me-3 d-none d-lg-block"
            />
          )}

          <div className="d-flex align-items-center gap-2">
            <div className="d-none d-lg-flex gap-2">
              {userOrLoginButton}
              {signupOrLogOutButton}
            </div>
            <Button
              icon={faSearch}
              variant="secondary"
              small={true}
              square={true}
              onClick={handleSearchButtonClick}
              className="d-lg-none"
            />
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
