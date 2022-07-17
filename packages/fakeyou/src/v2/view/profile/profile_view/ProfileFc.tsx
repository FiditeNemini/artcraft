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
  faFirefox,
  faGithub,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faClock, faDollarSign } from "@fortawesome/free-solid-svg-icons";
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

interface Props {
  sessionWrapper: SessionWrapper;
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
    return <h1 className="title is-1">User not found</h1>;
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
        <Link
          className={"button is-large is-fullwidth is-info"}
          to={editLinkUrl}
        >
          {buttonLabel}
        </Link>
        <br />
      </>
    );
  }

  let banUserButton = <span />;

  if (props.sessionWrapper.canBanUsers()) {
    const currentlyBanned = userData.maybe_moderator_fields?.is_banned;
    const banLinkUrl = FrontendUrlConfig.userProfileBanPage(userData.username);
    const buttonLabel = currentlyBanned ? "Unban User" : "Ban User";
    const banButtonCss = currentlyBanned
      ? "button is-warning is-large is-fullwidth"
      : "button is-danger is-large is-fullwidth";

    banUserButton = (
      <>
        <Link className={banButtonCss} to={banLinkUrl}>
          {buttonLabel}
        </Link>
        <br />
      </>
    );
  }

  let profileRows: Array<JSX.Element> = [];

  if (userData.website_url !== undefined && userData.website_url !== null) {
    let websiteUrl = <span>{userData.website_url}</span>;
    if (
      userData.website_url?.startsWith("http://") ||
      userData.website_url?.startsWith("https://")
    ) {
      websiteUrl = (
        <a
          href={userData.website_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {userData.website_url}
        </a>
      );
    }

    profileRows.push(
      <tr key="website">
        <th>
          Website&nbsp;
          <FontAwesomeIcon icon={faFirefox} />
        </th>
        <td>{websiteUrl}</td>
      </tr>
    );
  }

  if (userData.twitch_username) {
    let twitchUrl = `https://twitch.com/${userData.twitch_username}`;
    let twitchLink = (
      <a href={twitchUrl} target="_blank" rel="noopener noreferrer nofollow">
        {userData.twitch_username}
      </a>
    );
    profileRows.push(
      <tr key="twitch">
        <th>
          Twitch&nbsp;
          <FontAwesomeIcon icon={faTwitch} />
        </th>
        <td>{twitchLink}</td>
      </tr>
    );
  }

  if (userData.twitter_username) {
    let twitterUrl = `https://twitter.com/${userData.twitter_username}`;
    let twitterLink = (
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer nofollow">
        @{userData.twitter_username}
      </a>
    );
    profileRows.push(
      <tr key="twitter">
        <th>
          Twitter&nbsp;
          <FontAwesomeIcon icon={faTwitter} />
        </th>
        <td>{twitterLink}</td>
      </tr>
    );
  }

  if (userData.discord_username) {
    profileRows.push(
      <tr key="discord">
        <th>
          Discord&nbsp;
          <FontAwesomeIcon icon={faDiscord} />
        </th>
        <td>{userData.discord_username}</td>
      </tr>
    );
  }

  if (userData.github_username) {
    let githubUrl = `https://github.com/${userData.github_username}`;
    let githubLink = (
      <a href={githubUrl} target="_blank" rel="noopener noreferrer nofollow">
        {userData.github_username}
      </a>
    );
    profileRows.push(
      <tr key="github">
        <th>
          Github&nbsp;
          <FontAwesomeIcon icon={faGithub} />
        </th>
        <td>{githubLink}</td>
      </tr>
    );
  }

  if (userData.cashapp_username) {
    // NB: URL includes a dollar sign
    let cashAppUrl = `https://cash.me/$${userData.cashapp_username}`;
    let cashAppLink = (
      <a href={cashAppUrl} target="_blank" rel="noopener noreferrer nofollow">
        ${userData.cashapp_username}
      </a>
    );
    profileRows.push(
      <tr key="cashapp">
        <th>
          CashApp&nbsp;
          <FontAwesomeIcon icon={faDollarSign} />
        </th>
        <td>{cashAppLink}</td>
      </tr>
    );
  }

  const createdAt = new Date(userData.created_at);
  const joinDate = format(createdAt, "LLLL y");
  profileRows.push(
    <tr key="created">
      <th>
        Joined&nbsp;
        <FontAwesomeIcon icon={faClock} />
      </th>
      <td>{joinDate}</td>
    </tr>
  );

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
    <div className="container">
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

export { ProfileFc };
