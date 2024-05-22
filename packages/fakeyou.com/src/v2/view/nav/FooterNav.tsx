import React, { useCallback, useEffect, useState } from "react";
import { GitSha } from "@storyteller/components/src/elements/GitSha";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";
import { ModerationIcon } from "../_icons/ModerationIcon";
import { WebUrl } from "../../../common/WebUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitch,
  faDiscord,
  faTwitter,
  faTiktok,
  faRedditAlien,
} from "@fortawesome/free-brands-svg-icons";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";
import {
  GetServerInfo,
  GetServerInfoIsOk,
  GetServerInfoSuccessResponse,
} from "@storyteller/components/src/api/server/GetServerInfo";
import { useLocalize } from "hooks";
import { Container } from "components/common";
import { useDomainConfig } from "context/DomainConfigContext";
import { GetDiscordLink } from "@storyteller/components/src/env/GetDiscordLink";

interface Props {
  sessionWrapper: SessionWrapper;
}

function FooterNav(props: Props) {
  const domain = useDomainConfig();
  const { t } = useLocalize("Footer");
  const [serverInfo, setServerInfo] = useState<
    GetServerInfoSuccessResponse | undefined
  >(undefined);

  const getServerInfo = useCallback(async () => {
    const response = await GetServerInfo();
    if (GetServerInfoIsOk(response)) {
      setServerInfo(response);
    }
  }, []);

  useEffect(() => {
    getServerInfo();
  }, [getServerInfo]);

  //let myDataLink = WebUrl.signupPage();

  //if (props.sessionWrapper.isLoggedIn()) {
  //  let username = props.sessionWrapper.getUsername() as string; // NB: Should be present if logged in
  //  myDataLink = WebUrl.userProfilePage(username);
  //}

  let moderationLink = <span />;

  if (props.sessionWrapper.canBanUsers()) {
    moderationLink = (
      <div className="mb-4 mb-lg-0 me-0 me-lg-4">
        <Link to={WebUrl.moderationMain()}>
          <ModerationIcon />
          <span className="ms-2">Mod Controls</span>
        </Link>
      </div>
    );
  }

  let serverGitSha = <></>;

  if (
    serverInfo !== undefined &&
    !!serverInfo.server_build_sha &&
    serverInfo.server_build_sha !== "undefined"
  ) {
    serverGitSha = (
      <div className="d-flex flex-column flex-lg-row align-items-center">
        <div className="git-sha">
          API: {serverInfo.server_build_sha.substring(0, 8)}
        </div>
      </div>
    );
  }

  const isOnStudioPage = window.location.pathname.includes("/studio");

  const footerSections = [
    {
      title: "Create",
      items: [
        {
          link: "https://studio.storyteller.ai",
          text: "Creation Engine",
          icon: null,
        },
        { link: "/explore", text: "Explore Videos", icon: null },
        { link: "/tools", text: "AI Tools", icon: null },
        // { link: "/upload-assets", text: "Upload Assets", icon: null },
      ],
      condition: true,
    },
    {
      title: "Community",
      items: [
        { link: "/beta-key/list", text: "Share Beta Keys", icon: null },
        { link: "/beta-key/redeem", text: "Redeem Beta Key", icon: null },
        {
          link: GetDiscordLink(),
          text: "Discord",
          icon: faDiscord,
        },
        // { link: "/forums", text: "Forums", icon: null },
      ],
      condition: true,
    },
    // {
    //   title: "New",
    //   items: [
    //     { link: "/news-updates", text: "News and Updates", icon: null },
    //     { link: "/feature-requests", text: "Feature Requests", icon: null },
    //     { link: "/bug-reports", text: "Bug Reports", icon: null },
    //   ],
    //   condition: true,
    // },
    {
      title: "Info",
      items: [
        { link: "/pricing", text: "Pricing", icon: null },
        { link: "/about", text: "About", icon: null },
        { link: "/terms", text: "ToS", icon: null },
        { link: "/privacy", text: "Privacy", icon: null },
      ],
      condition: true,
    },
  ];

  return (
    <>
      {!isOnStudioPage && (
        <footer id="footer">
          <Container type="panel" className="py-5">
            <div className="row g-5">
              <div className="col-12 col-lg-3 d-flex flex-column gap-4 align-items-center pb-2">
                <Link to="/">
                  <img
                    src={domain.logo}
                    alt={`${domain.titlePart}: Cartoon and Celebrity Text to Speech`}
                    height="34"
                  />
                </Link>
                <div className="d-flex gap-3 mt-1">
                  <a
                    className="social-icon"
                    href={GetDiscordLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Join our Discord Server"
                  >
                    <FontAwesomeIcon icon={faDiscord} className="me-2" />
                  </a>
                  <a
                    className="social-icon"
                    href={ThirdPartyLinks.STORYTELLER_REDDIT}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Join our subreddit"
                  >
                    <FontAwesomeIcon icon={faRedditAlien} className="me-2" />
                  </a>
                  <a
                    className="social-icon"
                    href={ThirdPartyLinks.FAKEYOU_TWITTER_WITH_FOLLOW_INTENT}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow us on Twitter"
                  >
                    <FontAwesomeIcon icon={faTwitter} className="me-2" />
                  </a>
                  <a
                    className="social-icon"
                    href={ThirdPartyLinks.FAKEYOU_TIKTOK}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow us on Tiktok"
                  >
                    <FontAwesomeIcon icon={faTiktok} className="me-2" />
                  </a>
                  <a
                    className="social-icon"
                    href={ThirdPartyLinks.STORYTELLER_TWITCH}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Subscribe to our Twitch Channel"
                  >
                    <FontAwesomeIcon icon={faTwitch} className="me-2" />
                  </a>
                </div>
              </div>

              {footerSections.map((section, index) => (
                <div
                  key={index}
                  className={`py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start ${
                    section.condition ? "" : "d-none"
                  }`}
                >
                  <p className="fw-bold">{t(section.title)}</p>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a href={item.link}>
                        {item.icon ? (
                          <FontAwesomeIcon icon={item.icon} className="me-2" />
                        ) : (
                          ""
                        )}
                        {item.text}
                      </a>
                    </li>
                  ))}
                </div>
              ))}
            </div>

            <div className="pt-4">
              <hr />
            </div>

            <div className="d-flex flex-column flex-lg-row pt-2 align-items-center gap-2 gap-xl-4 flex-wrap">
              <span className="flex-grow-1 opacity-75">
                © {domain.titlePart} 2024
              </span>

              <div className="d-flex flex-column flex-lg-row align-items-center mt-4 mt-lg-0">
                {moderationLink}
              </div>

              {serverGitSha}

              <div className="d-flex flex-column flex-lg-row align-items-center">
                <GitSha prefix="FE: " />
              </div>
            </div>
          </Container>
        </footer>
      )}
    </>
  );
}

export { FooterNav };
