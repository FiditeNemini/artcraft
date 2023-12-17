import {
  faBars,
  faSearch,
  faUser,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import { Button } from "components/common";
import SearchBar from "components/common/SearchBar";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { WebUrl } from "common/WebUrl";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

interface TopNavProps {
  sessionWrapper: SessionWrapper;
}

export default function TopNav({ sessionWrapper }: TopNavProps) {
  let history = useHistory();
  const [isMobileSearchBarVisible, setIsMobileSearchBarVisible] =
    useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapper = document.getElementById("wrapper");
  const [menuButtonIcon, setMenuButtonIcon] = useState(faBars);

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

  let signupOrProfileButton = (
    <>
      <Button label="Sign Up" small onClick={() => history.push("/signup")} />
    </>
  );

  if (sessionWrapper.isLoggedIn()) {
    let displayName = sessionWrapper.getDisplayName();
    if (displayName === undefined) {
      displayName = "My Account";
    }
    let url = WebUrl.userProfilePage(displayName);
    signupOrProfileButton = (
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

  return (
    <div id="topbar-wrapper" className="position-fixed">
      <div className="topbar-nav">
        <div className="topbar-nav-left">
          <Link to="/">
            <img
              src="/fakeyou/FakeYou-Logo.png"
              alt="FakeYou: Cartoon and Celebrity Text to Speech"
              height="34"
              className="mb-2 d-none d-lg-block"
            />
            <img
              src="/fakeyou/FakeYou-Logo-Mobile.png"
              alt="FakeYou: Cartoon and Celebrity Text to Speech"
              height="36"
              className="mb-0 d-block d-lg-none"
            />
          </Link>
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
          <div className="d-flex align-items-center gap-2">
            {signupOrProfileButton}
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
