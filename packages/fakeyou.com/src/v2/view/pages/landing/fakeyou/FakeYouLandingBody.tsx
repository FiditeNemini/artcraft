import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GetDiscordLink } from "@storyteller/components/src/env/GetDiscordLink";
// import { Panel } from "components/common";
import { useLocalize } from "hooks";
import React from "react";
// import { Link } from "react-router-dom";

interface FakeYouLandingBodyProps {}

export default function FakeYouLandingBody(props: FakeYouLandingBodyProps) {
  const { t } = useLocalize("LandingPage");

  return (
    <>
      {/* <Panel clear={true}>
        <div className="section px-md-5 px-xl-3">
          <div className="row g-4 g-lg-5 flex-row-reverse">
            <div className="col-12 col-md-6 col-lg-7">
              <div className="position-relative">
                <div className="ratio ratio-16x9 video-container">
                  <video
                    autoPlay={true}
                    playsInline={true}
                    loop={true}
                    muted={true}
                  >
                    <source src="/videos/tts-video.mp4" type="video/mp4" />
                  </video>
                </div>
                <img
                  src="/images/landing/bg-dots.webp"
                  alt="background dots"
                  className="dots-right-bottom"
                />
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-5 d-flex flex-column justify-content-center gap-3">
              <h2 className="fw-bold">{t("contextTitle")}</h2>
              <p className="opacity-75">{t("contextText")}</p>
              <div className="d-flex mt-3 gap-3">
                <Link to="/tts" className="btn btn-primary">
                  {t("contextButtonTts")}
                </Link>
                <Link to="/voice-conversion" className="btn btn-primary">
                  {t("contextButtonVc")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Panel> */}

      <div className="section">
        <div className="container text-center community-container">
          <div className="panel px-4 py-5 d-flex flex-column align-items-center community-container rounded">
            <h2 className="fw-bold mb-2">{t("communityTitle")}</h2>
            <p className="opacity-75">{t("communityText")}</p>
            <div className="d-flex mt-4 gap-3">
              <a
                href={GetDiscordLink()}
                target="_blank"
                rel="noreferrer"
                className="btn btn-discord"
              >
                <FontAwesomeIcon icon={faDiscord} className="me-2" />
                {t("communityButtonDiscord")}
              </a>
              <a
                href="https://twitter.com/intent/follow?screen_name=FakeYouApp"
                target="_blank"
                rel="noreferrer"
                className="btn btn-twitter"
              >
                <FontAwesomeIcon icon={faTwitter} className="me-2" />
                {t("communityButtonTwitter")}
              </a>
            </div>
          </div>
          <img
            src="/images/landing/bg-dots.webp"
            alt="background dots"
            className="dots-right-bottom me-3"
          />
        </div>
      </div>
    </>
  );
}
