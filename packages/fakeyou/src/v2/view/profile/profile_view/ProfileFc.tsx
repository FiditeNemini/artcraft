import React, { useCallback, useEffect, useState } from "react";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { Link } from "react-router-dom";
import { ProfileTtsInferenceResultsListFc } from "./Profile_TtsInferenceResultListFc";
import { ProfileTtsModelListFc } from "./Profile_TtsModelListFc";
import { ProfileW2lInferenceResultsListFc } from "./Profile_W2lInferenceResultListFc";
import { ProfileW2lTemplateListFc } from "./Profile_W2lTemplateListFc";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faGithub,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faClock,
  faBan,
  faGear,
  faAward,
  faVolumeHigh,
  faVideo,
  faGlobe,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

import {
  GetUserByUsername,
  GetUserByUsernameIsErr,
  GetUserByUsernameIsOk,
  User,
  UserLookupError,
} from "../../../api/user/GetUserByUsername";
import { format } from "date-fns";
import { FrontendUrlConfig } from "../../../../common/FrontendUrlConfig";
import { USE_REFRESH } from "../../../../Refresh";
import { distance, duration, delay, delay2 } from "../../../../data/animation";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
const Fade = require("react-reveal/Fade");

interface Props {
  sessionWrapper: SessionWrapper;
}

function copyToClipboard(username: string): void {
  navigator.clipboard.writeText(username);
  alert("Copied the text: " + username);
}

function ProfileFc(props: Props) {
  const { username }: { username: string } = useParams();

  const [userData, setUserData] = useState<User | undefined>(undefined);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  const getUser = useCallback(async (username) => {
    const response = await GetUserByUsername(username);
    if (GetUserByUsernameIsOk(response)) {
      setUserData(response);
    } else if (GetUserByUsernameIsErr(response)) {
      switch (response) {
        case UserLookupError.NotFound:
          setNotFoundState(true);
          break;
      }
    }
  }, []);

  useEffect(() => {
    getUser(username);
  }, [username, getUser]);

  if (notFoundState) {
    return (
      <div className="container py-5">
        <h1 className="text-center fw-bold">User not found</h1>
      </div>
    );
  }

  if (!userData) {
    return <div />;
  }

  let userEmailHash = userData.email_gravatar_hash;

  let editProfileButton = <span />;

  if (props.sessionWrapper.canEditUserProfile(userData.username)) {
    const editLinkUrl = FrontendUrlConfig.userProfileEditPage(
      userData.username
    );

    // Mods shouldn't edit preferences.
    const buttonLabel = props.sessionWrapper.userTokenMatches(
      userData.user_token
    )
      ? "Edit Profile & Preferences"
      : "Edit Profile";

    editProfileButton = (
      <>
        <Link className={"btn btn-secondary"} to={editLinkUrl}>
          <FontAwesomeIcon icon={faGear} className="me-2" />
          {buttonLabel}
        </Link>
      </>
    );
  }

  let banUserButton = <span />;

  if (props.sessionWrapper.canBanUsers()) {
    const currentlyBanned = userData.maybe_moderator_fields?.is_banned;
    const banLinkUrl = FrontendUrlConfig.userProfileBanPage(userData.username);
    const buttonLabel = currentlyBanned ? "Unban User" : "Ban User";
    const banButtonCss = currentlyBanned
      ? "btn btn-secondary"
      : "btn btn-destructive";

    banUserButton = (
      <>
        <Link className={banButtonCss} to={banLinkUrl}>
          <FontAwesomeIcon icon={faBan} className="me-2" />
          {buttonLabel}
        </Link>
      </>
    );
  }

  let profileRows: Array<JSX.Element> = [];
  let profileJoinDate: Array<JSX.Element> = [];

  const createdAt = new Date(userData.created_at);
  const joinDate = format(createdAt, "LLLL y");
  profileJoinDate.push(
    <div
      key="created"
      className="d-flex align-items-center justify-content-center fs-6 me-3"
    >
      <FontAwesomeIcon icon={faClock} className="me-2" />
      <p className="fw-bold">Joined {joinDate}</p>
    </div>
  );

  if (userData.website_url !== undefined && userData.website_url !== null) {
    let websiteUrl = <span>{userData.website_url}</span>;
    if (
      userData.website_url?.startsWith("http://") ||
      userData.website_url?.startsWith("https://")
    ) {
      websiteUrl = (
        <Tippy content="Website">
          <a
            href={userData.website_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <FontAwesomeIcon icon={faGlobe} />
          </a>
        </Tippy>
      );
    }

    profileRows.push(<div key="website">{websiteUrl}</div>);
  }

  if (userData.twitch_username) {
    let twitchUrl = `https://twitch.com/${userData.twitch_username}`;
    let twitchLink = (
      <Tippy content="Twitch">
        <a href={twitchUrl} target="_blank" rel="noopener noreferrer nofollow">
          <FontAwesomeIcon icon={faTwitch} />
        </a>
      </Tippy>
    );

    profileRows.push(<div key="twitch">{twitchLink}</div>);
  }

  if (userData.twitter_username) {
    let twitterUrl = `https://twitter.com/${userData.twitter_username}`;
    let twitterLink = (
      <Tippy content="Twitter">
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer nofollow">
          <FontAwesomeIcon icon={faTwitter} />
        </a>
      </Tippy>
    );
    profileRows.push(<div key="twitter">{twitterLink}</div>);
  }


  if (userData.discord_username) {
    profileRows.push(
      <Tippy
        content={
          <span className="text-center">
            Discord
            <br />
            {userData.discord_username}
          </span>
        }
      >
        <a href="/" onClick={copyToClipboard(userData.discord_username)}>
          <FontAwesomeIcon icon={faDiscord} />
        </a>
      </Tippy >
    );
  }

  if (userData.github_username) {
    let githubUrl = `https://github.com/${userData.github_username}`;
    let githubLink = (
      <Tippy content="GitHub">
        <a href={githubUrl} target="_blank" rel="noopener noreferrer nofollow">
          <FontAwesomeIcon icon={faGithub} />
        </a>
      </Tippy>
    );
    profileRows.push(<div key="github">{githubLink}</div>);
  }

  if (userData.cashapp_username) {
    // NB: URL includes a dollar sign
    let cashAppUrl = `https://cash.me/$${userData.cashapp_username}`;
    let cashAppLink = (
      <Tippy content="CashApp">
        <a href={cashAppUrl} target="_blank" rel="noopener noreferrer nofollow">
          <FontAwesomeIcon icon={faDollarSign} />
        </a>
      </Tippy>
    );
    profileRows.push(<div key="cashapp">{cashAppLink}</div>);
  }

  let badges = <div>None yet</div>;

  if (userData.badges.length !== 0) {
    let badgeList: Array<JSX.Element> = [];
    userData.badges.forEach((badge) => {
      badgeList.push(<li key={badge.slug}>{badge.title}</li>);
    });
    badges = <ul>{badgeList}</ul>;
  }

  if (!USE_REFRESH) {
    return (
      <div className="content">
        <h1 className="title is-1">
          <Gravatar
            size={45}
            username={userData.display_name}
            email_hash={userEmailHash}
          />
          {userData.display_name}
        </h1>

        {editProfileButton}
        {banUserButton}

        <div
          className="profile content is-medium"
          dangerouslySetInnerHTML={{
            __html: userData.profile_rendered_html || "",
          }}
        />

        <table className="table">
          <tbody>{profileRows}</tbody>
        </table>

        <h3 className="title is-3"> Badges (images coming soon) </h3>
        {badges}

        <h3 className="title is-3"> TTS Results </h3>
        <ProfileTtsInferenceResultsListFc username={userData.username} />

        <h3 className="title is-3"> Lipsync Results </h3>
        <ProfileW2lInferenceResultsListFc username={userData.username} />

        <h3 className="title is-3"> Uploaded TTS Models </h3>
        <ProfileTtsModelListFc username={userData.username} />

        <h3 className="title is-3"> Uploaded Templates </h3>
        <ProfileW2lTemplateListFc username={userData.username} />
      </div>
    );
  }

  return (
    <div>
      <Fade bottom cascade duration={duration} distance={distance}>
        <div className="container pt-5 pb-4 px-lg-5 px-xl-3">
          <div className="d-flex flex-column flex-lg-row align-items-center">
            <div className="mb-3 me-lg-4 mb-lg-0">
              <Gravatar
                size={45}
                username={userData.display_name}
                email_hash={userEmailHash}
              />
            </div>
            <h1 className="display-5 fw-bold text-center text-lg-start w-100 mb-0">
              {userData.display_name}
            </h1>
            <div className="w-100 justify-content-end d-none d-lg-flex">
              <div className="d-flex gap-3">
                {editProfileButton}
                {banUserButton}
              </div>
            </div>
          </div>
          <div className="d-flex flex-column flex-lg-row gap-3 mt-3">
            {profileJoinDate}
            <div className="d-flex justify-content-center gap-3 fs-5">
              {profileRows}
            </div>
          </div>
        </div>
      </Fade>

      <Fade bottom duration={duration} delay={delay} distance={distance}>
        <div
          className="container content mb-4 mb-lg-5 text-center text-lg-start px-4 px-md-5 px-lg-5 px-xl-3"
          dangerouslySetInnerHTML={{
            __html: userData.profile_rendered_html || "",
          }}
        />
        <div className="container d-flex d-lg-none my-5">
          <div className="d-flex w-100 gap-3 justify-content-center flex-column flex-md-row">
            {editProfileButton}
            {banUserButton}
          </div>
        </div>
      </Fade>

      <Fade
        bottom
        cascade
        duration={duration}
        delay={delay2}
        distance={distance}
      >
        <div className="container-panel py-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">
              <FontAwesomeIcon icon={faAward} className="me-3" />
              Badges{" "}
              <span className="fs-5 fw-normal ms-2">(images coming soon)</span>
            </h2>
            <div className="py-6">{badges}</div>
          </div>
        </div>

        <div className="container-panel pt-3 pb-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">
              <FontAwesomeIcon icon={faVolumeHigh} className="me-3" />
              TTS Results
            </h2>
            <div className="py-6">
              <ProfileTtsInferenceResultsListFc username={userData.username} />
            </div>
          </div>
        </div>

        <div className="container-panel pt-3 pb-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">
              <FontAwesomeIcon icon={faVideo} className="me-3" />
              Lipsync Results
            </h2>
            <div className="py-6">
              <ProfileW2lInferenceResultsListFc username={userData.username} />
            </div>
          </div>
        </div>

        <div className="container-panel pt-3 pb-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">Uploaded TTS Models </h2>
            <div className="py-6">
              <ProfileTtsModelListFc username={userData.username} />
            </div>
          </div>
        </div>

        <div className="container-panel pt-3 pb-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">Uploaded Templates </h2>
            <div className="py-6">
              <ProfileW2lTemplateListFc username={userData.username} />
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );
}

export { ProfileFc };
