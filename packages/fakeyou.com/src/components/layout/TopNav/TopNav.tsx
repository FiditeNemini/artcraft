import { Button } from "components/common";
import React from "react";
import { Link } from "react-router-dom";

interface TopNavProps {}

export default function TopNav(props: TopNavProps) {
  return (
    <div id="topbar-wrapper" className="position-fixed">
      <div className="topbar-nav">
        <Link to="/">
          <img
            src="/fakeyou/FakeYou-Logo.png"
            alt="FakeYou: Cartoon and Celebrity Text to Speech"
            height="36"
            className="mb-2"
          />
        </Link>
        <div className="sidebar-buttons d-flex gap-2 mt-4">
          {/* {userOrLoginButton}
        {signupOrLogOutButton} */}
          <Button label="Login" small={true} />
        </div>
      </div>
    </div>
  );
}
