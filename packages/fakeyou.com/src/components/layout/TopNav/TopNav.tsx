import { faBars, faSearch, faUser } from "@fortawesome/pro-solid-svg-icons";
import { Button } from "components/common";
import SearchBar from "components/common/SearchBar";
import React from "react";
import { Link, useHistory } from "react-router-dom";
import { WebUrl } from "common/WebUrl";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

interface TopNavProps {
  sessionWrapper: SessionWrapper;
}

export default function TopNav({ sessionWrapper }: TopNavProps) {
  let history = useHistory();

  const handleMenuButtonClick = () => {
    const wrapper = document.getElementById("wrapper");

    if (window.innerWidth < 1200) {
      if (wrapper) {
        wrapper.classList.toggle("toggled");
      }
    }
  };

  const handleSearchButtonClick = () => {};

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
            <SearchBar />
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
              icon={faBars}
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
      <div className="topbar-mobile-search-bar-container d-block d-lg-none">
        <div className="topbar-mobile-search-bar">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
