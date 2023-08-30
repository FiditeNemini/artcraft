import React from "react";
import "./MobileMenu.scss";
import Button from "components/common/Button/Button";
import { faBars } from "@fortawesome/pro-solid-svg-icons";

export default function MobileMenu() {
  const handleMenuButtonClick = () => {
    const wrapper = document.getElementById("wrapper");

    if (window.innerWidth < 1200) {
      if (wrapper) {
        wrapper.classList.toggle("toggled");
      }
    }
  };

  return (
    <div className="mobile-menu-container d-lg-none">
      <div className="mobile-menu">
        <div className="row">
          <div className="d-flex col-4">
            <Button
              label="Menu"
              icon={faBars}
              secondary
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
            <Button label="Sign Up" small onClick={handleMenuButtonClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
