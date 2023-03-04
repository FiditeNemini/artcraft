import { GitSha } from "@storyteller/components/src/elements/GitSha";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitch,
  faDiscord,
  faTwitter,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";

interface Props {}

function FooterNav(props: Props) {
  return (
    <div>
      <footer id="footer">
        <hr />
        <div className="container py-5">
          <div className="row gx-5 gy-5">
            <div className="col-12 col-lg-3 d-flex flex-column gap-4 align-items-center align-items-lg-start">
              <Link to="/">
                <img
                  src="/assets/powerstream-logo.png"
                  alt="PowerStream Logo"
                  height="32"
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
                  title="Support us by becoming a patreon"
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
            {/* <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
              <p className="fw-bold">AI Tools</p>
              <li>
                <Link to="/">Text to Speech</Link>
              </li>

              <li>
                <Link to="/video">Video Lipsync</Link>
              </li>
            </div> */}
            <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
              <p className="fw-bold">Links</p>
              <li>
                <a href="https://fakeyou.com">FakeYou</a>
              </li>
              <li>
                <a href="https://storyteller.ai">Storyteller AI</a>
              </li>
            </div>
            <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
              <p className="fw-bold">Info</p>
              <li>
                <a className="footer-link" href="#features">
                  Features
                </a>
              </li>

              <li>
                <a className="footer-link" href="#voices">
                  Voice Previews
                </a>
              </li>

              <li>
                <a className="footer-link" href="#insights">
                  Insights
                </a>
              </li>

              <li>
                <a className="footer-link" href="#community">
                  Community
                </a>
              </li>
            </div>
          </div>

          <div className="pt-4">
            <hr />
          </div>

          <div className="d-flex flex-column flex-lg-row pt-2 align-items-center gap-4">
            <span className="flex-grow-1">
              © 2023 PowerStream by{" "}
              <a href="https://storyteller.ai">Storyteller.ai</a>
            </span>

            <div className="d-flex flex-column flex-lg-row align-items-center ">
              <GitSha prefix="FE: " />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { FooterNav };
