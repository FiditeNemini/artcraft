import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { Button } from "components/common";
import SearchBar from "components/common/SearchBar";
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
            height="34"
            className="mb-1"
          />
        </Link>

        {/* Search Bar */}
        <SearchBar />

        <div className="d-flex align-items-center gap-3">
          <div className="sidebar-buttons d-flex gap-2">
            {/* {userOrLoginButton}
        {signupOrLogOutButton} */}
            <Button label="Login" small={true} />
          </div>
          <div>
            <Gravatar size={40} />
          </div>
        </div>
      </div>
    </div>
  );
}
