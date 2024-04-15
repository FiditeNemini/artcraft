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

  let myDataLink = WebUrl.signupPage();

  if (props.sessionWrapper.isLoggedIn()) {
    let username = props.sessionWrapper.getUsername() as string; // NB: Should be present if logged in
    myDataLink = WebUrl.userProfilePage(username);
  }

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

  return (
    <>
      {!isOnStudioPage && (
        <footer id="footer">
          <Container type="panel" className="py-5">
            <div className="row g-5">
              <div className="col-12 col-lg-3 d-flex flex-column gap-4 align-items-center align-items-lg-start">
                <Link to="/">
                  <img
                    src={domain.logo}
                    alt={`${domain.titlePart}: Cartoon and Celebrity Text to Speech`}
                    height="34"
                  />
                </Link>
                <div className="d-flex gap-3">
                  <a
                    className="social-icon"
                    href={ThirdPartyLinks.FAKEYOU_DISCORD}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Join our Discord Server"
                  >
                    <FontAwesomeIcon icon={faDiscord} className="me-2" />
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
                    href={ThirdPartyLinks.FAKEYOU_TWITCH}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Subscribe to our Twitch Channel"
                  >
                    <FontAwesomeIcon icon={faTwitch} className="me-2" />
                  </a>
                </div>
              </div>
              <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
                <p className="fw-bold">{t("productsTitle")}</p>
                <li>
                  <Link to="/tts">{t("productTts")}</Link>
                </li>

                <li>
                  <Link to="/voice-conversion">{t("productVc")}</Link>
                </li>

                <li>
                  <Link to="/voice-designer">Voice Designer</Link>
                </li>

                <li>
                  <Link to="/face-animator">{t("productFaceAnimator")}</Link>
                </li>

                <li>
                  <Link to="/video-styletransfer">Video Style Transfer</Link>
                </li>

                <li>
                  <Link to="/contribute">{t("productUploadModels")}</Link>
                </li>
              </div>
              <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
                <p className="fw-bold">{t("communityTitle")}</p>

                <li>
                  <a
                    href={ThirdPartyLinks.FAKEYOU_DISCORD}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("communityDiscord")}
                  </a>
                </li>

                <li>
                  <Link to="/leaderboard">{t("communityLeaderboard")}</Link>
                </li>

                <li>
                  <Link to="/guide">{t("communityGuide")}</Link>
                </li>

                <li>
                  <Link to={myDataLink}>{t("communityProfile")}</Link>
                </li>
              </div>
              <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
                <p className="fw-bold">{t("infoTitle")}</p>
                <li>
                  <Link to={WebUrl.pricingPageWithReferer("footer")}>
                    {t("infoPricing")}
                  </Link>
                </li>
                <li>
                  <Link to={WebUrl.aboutUsPage()}>{t("infoAbout")}</Link>
                </li>

                <li>
                  <Link to={WebUrl.termsPage()}>{t("infoTerms")}</Link>
                </li>

                <li>
                  <Link to={WebUrl.privacyPage()}>
                    {t("infoPrivacyPolicy")}
                  </Link>
                </li>
                <li>
                  <a href={WebUrl.developerDocs()}>{t("infoApiDocs")}</a>
                </li>
              </div>
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
