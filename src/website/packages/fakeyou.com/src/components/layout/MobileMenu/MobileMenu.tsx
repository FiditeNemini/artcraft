import React from "react";
import "./MobileMenu.scss";
import Button from "components/common/Button/Button";
import { faBars } from "@fortawesome/pro-solid-svg-icons";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useHistory } from "react-router-dom";
import { WebUrl } from "common/WebUrl";
import { faUser } from "@fortawesome/pro-solid-svg-icons";

interface MobileMenuProps {
  sessionWrapper: SessionWrapper;
}

export default function MobileMenu(props: MobileMenuProps) {
  let history = useHistory();
  const handleMenuButtonClick = () => {
    const wrapper = document.getElementById("wrapper");

    if (window.innerWidth < 1200) {
      if (wrapper) {
        wrapper.classList.toggle("toggled");
      }
    }
  };

  const loggedIn = props.sessionWrapper.isLoggedIn();

  let signupOrProfileButton = (
    <>
      <Button
        label="Sign Up"
        small={true}
        onClick={() => history.push("/signup")}
      />
    </>
  );

  if (loggedIn) {
    let displayName = props.sessionWrapper.getDisplayName();
    if (displayName === undefined) {
      displayName = "My Account";
    }
    let url = WebUrl.userProfilePage(displayName);
    signupOrProfileButton = (
      <>
        <Button
          icon={faUser}
          label="Profile"
          small
          variant="secondary"
          onClick={() => history.push(url)}
        />
      </>
    );
  }

  return (
    <div className="mobile-menu-container d-lg-none">
      <div className="mobile-menu">
        <div className="row">
          <div className="d-flex col-4">
            <Button
              label="Menu"
              icon={faBars}
              variant="secondary"
              small
              onClick={handleMenuButtonClick}
            />
          </div>
          <div className="d-flex col-4 justify-content-center align-items-center">
            <img
              src="/fakeyou/FakeYou-Logo-Mobile.png"
              alt="FakeYou Mobile Logo"
              height="36"
            />
          </div>
          <div className="d-flex col-4 justify-content-end">
            {signupOrProfileButton}
          </div>
        </div>
      </div>
    </div>
  );
}
