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
import {
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faGithub,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faBan,
  faGear,
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
} from "@storyteller/components/src/api/user/GetUserByUsername";
import { format } from "date-fns";
import { WebUrl } from "../../../../../common/WebUrl";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import { usePrefixedDocumentTitle } from "../../../../../common/UsePrefixedDocumentTitle";
import { faCalendarAlt } from "@fortawesome/pro-solid-svg-icons";
import { CommentComponent } from "../../../_common/comments/CommentComponent";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

// function copyToClipboard(username: string): any {
//   navigator.clipboard.writeText(username);
// }

function ProfilePage(this: any, props: Props) {
  const { username }: { username: string } = useParams();
  PosthogClient.recordPageview();

  const { pathname } = useLocation();
  const { url } = useRouteMatch();

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

  const documentTitle =
    userData?.display_name === undefined
      ? undefined
      : `${userData.display_name}`;
  usePrefixedDocumentTitle(documentTitle);

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
        const upgradeLinkUrl = WebUrl.pricingPage();

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
    const banLinkUrl = WebUrl.userProfileBanPage(userData.username);
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
    const editLinkUrl = WebUrl.userProfileEditPage(userData.username);

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

  let profileDesc = (
    <div className="mt-3 text-center text-lg-start opacity-50">
      No profile description.
    </div>
  );

  if (!!userData.profile_rendered_html) {
    profileDesc = (
      <div
        className="mt-3 text-center text-lg-start"
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
      className="d-flex align-items-center justify-content-center justify-content-lg-start"
    >
      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
      <p className="fw-normal">Joined {joinDate}</p>
    </div>
  );

  if (userData.website_url !== undefined && userData.website_url !== null) {
    let websiteUrl = <span>{userData.website_url}</span>;
    if (
      userData.website_url?.startsWith("http://") ||
      userData.website_url?.startsWith("https://")
    ) {
      websiteUrl = (
        <Tippy
          content="Website"
          hideOnClick
          placement="bottom"
          theme="fakeyou"
          arrow={false}
        >
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
      <Tippy
        content="Twitch"
        hideOnClick
        placement="bottom"
        theme="fakeyou"
        arrow={false}
      >
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
      <Tippy
        content="Twitter"
        hideOnClick
        placement="bottom"
        theme="fakeyou"
        arrow={false}
      >
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
        hideOnClick
        placement="bottom"
        theme="fakeyou"
        arrow={false}
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
      <Tippy
        content="GitHub"
        hideOnClick
        placement="bottom"
        theme="fakeyou"
        arrow={false}
      >
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="fw-normal"
        >
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
      <Tippy
        content="CashApp"
        hideOnClick
        placement="bottom"
        theme="fakeyou"
        arrow={false}
      >
        <a href={cashAppUrl} target="_blank" rel="noopener noreferrer nofollow">
          <FontAwesomeIcon icon={faDollarSign} />
        </a>
      </Tippy>
    );
    profileRows.push(<div key="cashapp">{cashAppLink}</div>);
  }

  const Badges = () => {
    return userData.badges.length ? (
      <ul>
        {userData.badges.map((badge) => (
          <li key={badge.slug}>{badge.title}</li>
        ))}
      </ul>
    ) : (
      <div>None yet</div>
    );
  };

  const Comments = () => (
    <div className="mt-3 mt-lg-0">
      <CommentComponent
        {...{
          entityType: "user",
          entityToken: userData?.user_token,
          sessionWrapper: props.sessionWrapper,
        }}
      />
    </div>
  );

  const tabs = [
    {
      Component: ProfileTtsInferenceResultsListFc,
      val: "ttsresults",
      txt: "TTS Results",
    },
    {
      Component: ProfileW2lInferenceResultsListFc,
      val: "w2lresults",
      txt: "Lipsync Results",
    },
    {
      Component: ProfileTtsModelListFc,
      val: "uploadedtts",
      txt: "Uploaded TTS Models",
    },
    {
      Component: ProfileW2lTemplateListFc,
      val: "uploadedw2l",
      txt: "Uploaded Templates",
    },
    { Component: Badges, val: "badges", txt: "Badges" },
    { Component: Comments, val: "comments", txt: "Comments" },
  ];

  const txtToUrl = (txt = "") => txt.replaceAll(" ", "-").toLowerCase();

  const tabLinks = tabs.map(({ val, txt }, key) => {
    let subParam = pathname.split(url + "/")[1] || "";
    let isActive = txtToUrl(txt) === subParam || (!subParam && !key);

    return (
      <li {...{ className: "nav-item", key, role: "presentation" }}>
        <Link
          {...{
            "aria-controls": val,
            "aria-selected": isActive,
            className: `nav-link${isActive ? " active" : ""}`,
            id: `${val}-tab`,
            role: "tab",
            to: `${url.replace(/\/$/, "")}/${txtToUrl(txt)}`,
          }}
        >
          {txt}
        </Link>
      </li>
    );
  });

  const BaseRoute = ({ baseUrl }: { baseUrl?: string }) => {
    return (
      <Route {...{ path: baseUrl || url }}>
        <div
          {...{
            "aria-labelledby": "ttsresults-tab",
            className: "tab-pane fade show active",
            id: "ttsresults",
            role: "tabpanel",
          }}
        >
          <ProfileTtsInferenceResultsListFc username={userData.username} />
        </div>
      </Route>
    );
  };

  const tabPanels = tabs.map(({ Component, txt, val }, key) => {
    let subRoute = `${url}/${txtToUrl(txt)}`;
    return !key ? (
      BaseRoute({ baseUrl: subRoute })
    ) : (
      <Route {...{ key, path: subRoute }}>
        <div
          {...{
            "aria-labelledby": `${val}-tab`,
            id: "val",
            role: "tabpanel",
          }}
          className="tab-pane fade show active p-3 p-lg-4"
        >
          <Component username={userData.username} />
        </div>
      </Route>
    );
  });

  return (
    <div>
      <div className="container pt-5 pb-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column flex-lg-row w-100">
          <div className="mb-3 me-lg-4 mb-lg-0">
            <div className="border-3 d-none d-lg-block">
              <Gravatar
                size={150}
                username={userData.display_name}
                email_hash={userEmailHash}
                avatarIndex={userData.default_avatar_index}
                backgroundIndex={userData.default_avatar_color_index}
              />
            </div>
            <div className="border-3 text-center d-lg-none">
              <Gravatar
                size={100}
                username={userData.display_name}
                email_hash={userEmailHash}
                avatarIndex={userData.default_avatar_index}
                backgroundIndex={userData.default_avatar_color_index}
              />
            </div>
          </div>
          <div className="d-flex flex-column w-100">
            <div className="d-flex">
              <h1 className="fw-bold mb-0 flex-grow-1 text-center text-lg-start">
                {userData.display_name}
              </h1>
              <div className="gap-3 d-none d-lg-flex">
                {banUserButton}
                {upgradeButton}
                {editProfileButton}
              </div>
            </div>
            <div className="opacity-75 mt-1">{profileJoinDate}</div>
            <div>{profileDesc}</div>
            <div className="d-flex mt-3 gap-4 gap-lg-3 profile-social-icons justify-content-center justify-content-lg-start">
              {profileRows}
            </div>
          </div>
        </div>
      </div>

      {profileButtonsMobile}

      <div className="container-panel mt-5">
        <div className="panel">
          <ul
            className="nav nav-tabs nav-profile justify-content-lg-center"
            id="myTab"
            role="tablist"
          >
            {tabLinks}
          </ul>
          <div className="tab-content" id="myTabContent">
            <Switch>
              {tabPanels}
              {<BaseRoute />}
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ProfilePage };
