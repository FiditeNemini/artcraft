import React from "react";
import { Link, useHistory } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Logout } from "@storyteller/components/src/api/session/Logout";
import { t } from "i18next";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";

interface Props {
  sessionWrapper: SessionWrapper;
  enableAlpha: boolean;
  querySessionAction: () => void;
}

function TopNavSessionButton(props: Props) {
  let history = useHistory();

  if (!props.enableAlpha) {
    return <nav />;
  }

  const logoutHandler = async () => {
    await Logout();
    props.querySessionAction();
    history.push("/");
  };

  let loggedIn = props.sessionWrapper.isLoggedIn();
  let displayName = props.sessionWrapper.getDisplayName();
  let gravatarHash = props.sessionWrapper.getEmailGravatarHash();
  let gravatar = <span />;

  if (displayName === undefined) {
    displayName = "My Account";
  }

  if (gravatarHash !== undefined) {
    gravatar = <Gravatar email_hash={gravatarHash} size={15} />;
  }

  let sessionLink = <span />;
  let logoutLink = <span />;

  if (loggedIn) {
    let url = `https://fakeyou.com/profile/${displayName}`;
    sessionLink = (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="btn btn-secondary"
      >
        {" "}
        {gravatar}&nbsp; {displayName} (FakeYou)
      </a>
    );
    logoutLink = (
      <button
        className="btn btn-destructive"
        onClick={async () => {
          await logoutHandler();
        }}
      >
        {t("common.logout")}
      </button>
    );
  } else {
    sessionLink = (
      <>
        <Link to="/login" className="nav-login me-2">
          Login
        </Link>
        <Link to="/signup" className="btn btn-primary">
          Sign Up
        </Link>
      </>
    );
  }

  return (
    <span className="d-flex gap-3 align-items-center">
      {sessionLink}
      {logoutLink}
    </span>
  );
}

export { TopNavSessionButton };
