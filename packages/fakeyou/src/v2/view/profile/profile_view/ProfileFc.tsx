/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useState } from "react";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { Link } from "react-router-dom";
import { ProfileTtsInferenceResultsListFc } from "./Profile_TtsInferenceResultListFc";
import { ProfileTtsModelListFc } from "./Profile_TtsModelListFc";
import { ProfileW2lInferenceResultsListFc } from "./Profile_W2lInferenceResultListFc";
import { ProfileW2lTemplateListFc } from "./Profile_W2lTemplateListFc";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
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
  faStar,
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
import { container, item, panel } from "../../../../data/animation";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import { motion } from "framer-motion";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

// function copyToClipboard(username: string): any {
//   navigator.clipboard.writeText(username);
// }

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
        <div className="py-5">
          <h1 className="fw-semibold text-center mb-4">User not found</h1>
          <div className="text-center">
            <Link className="btn btn-primary" to="/">
              Back to main
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <div />;
  }

  let userEmailHash = userData.email_gravatar_hash;

  let editProfileButton = undefined;

  let banUserButton = undefined;

  let upgradeButton = undefined;

  if (props.sessionWrapper.isLoggedIn()) {
    if (props.sessionWrapper.userTokenMatches(userData.user_token)) {
      if (!props.sessionSubscriptionsWrapper.hasPaidFeatures()) {
        const upgradeLinkUrl = FrontendUrlConfig.pricingPage();

        upgradeButton = (
          <>
            <Link className="btn btn-primary" to={upgradeLinkUrl}>
              <FontAwesomeIcon icon={faStar} className="me-2" />
              <span>Upgrade</span>
            </Link>
          </>
        );
      }
    }
  }

  if (props.sessionWrapper.canBanUsers()) {
    const currentlyBanned = userData.maybe_moderator_fields?.is_banned;
    const banLinkUrl = FrontendUrlConfig.userProfileBanPage(userData.username);
    const buttonLabel = currentlyBanned ? "Unban" : "Ban";
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

  let profileButtonsMobile = <span />;

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

    profileButtonsMobile = (
      <div className="container d-flex d-lg-none mb-4">
        <div className="d-flex w-100 gap-3 justify-content-center flex-column flex-md-row">
          {upgradeButton}
          {editProfileButton}
          {banUserButton}
        </div>
      </div>
    );
  }

  let profileDesc = undefined;

  if (!!userData.profile_rendered_html) {
    profileDesc = (
      <motion.div
        className="container content mb-5 mb-lg-5 text-center text-lg-start px-4 px-md-5 px-lg-5 px-xl-3"
        variants={item}
        dangerouslySetInnerHTML={{
          __html: userData.profile_rendered_html || "",
        }}
      />
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
        <Tippy content="Website" animation="shift-away">
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
      <Tippy content="Twitch" animation="shift-away">
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
      <Tippy content="Twitter" animation="shift-away">
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
        allowHTML
        content={
          <div className="text-center">
            Discord
            <br />
            <p className="fw-semibold fs-6">{userData.discord_username}</p>
          </div>
        }
        interactive
        animation="shift-away"
      >
        <a
          // eslint-disable-next-line no-script-url
          href="javascript:;"
          // onClick={copyToClipboard(userData.discord_username)}
        >
          <FontAwesomeIcon icon={faDiscord} />
        </a>
      </Tippy>
    );
  }

  if (userData.github_username) {
    let githubUrl = `https://github.com/${userData.github_username}`;
    let githubLink = (
      <Tippy content="GitHub" animation="shift-away">
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
      <Tippy content="CashApp" animation="shift-away">
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

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pt-5 pb-4 px-lg-5 px-xl-3">
        <motion.div
          className="d-flex flex-column flex-lg-row align-items-center"
          variants={item}
        >
          <div className="mb-3 me-lg-4 mb-lg-0">
            <Gravatar
              size={45}
              username={userData.display_name}
              email_hash={userEmailHash}
            />
          </div>
          <div className="d-flex flex-column flex-lg-row align-items-center gap-3">
            <h1 className="display-6 fw-bold text-center text-lg-start mb-0">
              {userData.display_name}
            </h1>
          </div>

          <div className="justify-content-end d-none d-lg-flex w-100">
            <div className="d-flex gap-3">
              {banUserButton}
              {upgradeButton}
              {editProfileButton}
            </div>
          </div>
        </motion.div>
        <motion.div
          className="d-flex flex-column flex-lg-row gap-4 gap-lg-3 mt-4"
          variants={item}
        >
          {profileJoinDate}
          <div className="d-flex justify-content-center gap-4 gap-lg-3 profile-social-icons">
            {profileRows}
          </div>
        </motion.div>
      </div>

      {profileDesc}

      {profileButtonsMobile}

      <motion.div className="container-panel py-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">
            <FontAwesomeIcon icon={faAward} className="me-3" />
            Badges{" "}
            <span className="fs-5 fw-normal ms-2">(images coming soon)</span>
          </h2>
          <div className="py-6">{badges}</div>
        </div>
      </motion.div>

      <motion.div className="container-panel pt-3 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">
            <FontAwesomeIcon icon={faVolumeHigh} className="me-3" />
            TTS Results
          </h2>
          <div className="py-6">
            <ProfileTtsInferenceResultsListFc username={userData.username} />
          </div>
        </div>
      </motion.div>

      <motion.div className="container-panel pt-3 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">
            <FontAwesomeIcon icon={faVideo} className="me-3" />
            Lipsync Results
          </h2>
          <div className="py-6">
            <ProfileW2lInferenceResultsListFc username={userData.username} />
          </div>
        </div>
      </motion.div>

      <motion.div className="container-panel pt-3 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Uploaded TTS Models </h2>
          <div className="py-6">
            <ProfileTtsModelListFc username={userData.username} />
          </div>
        </div>
      </motion.div>

      <motion.div className="container-panel pt-3 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Uploaded Templates </h2>
          <div className="py-6">
            <ProfileW2lTemplateListFc username={userData.username} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { ProfileFc };
