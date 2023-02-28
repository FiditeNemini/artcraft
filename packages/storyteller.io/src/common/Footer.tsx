import React from "react";
import { GitSha } from "@storyteller/components/src/elements/GitSha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faFacebook,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

interface Props {}

function Footer(props: Props) {
  return (
    <>
      <footer data-scroll-section>
        <div className="bg-dark-solid">
          <div className="container footer-top text-center">
            <div className="d-flex gap-4 justify-content-center p-4">
              <a
                href="https://discord.gg/fakeyou"
                className="footer-social-icon"
                rel="noreferrer"
                target="_blank"
              >
                <FontAwesomeIcon icon={faDiscord} />
              </a>
              <a
                href="https://twitch.tv/FakeYouLabs"
                className="footer-social-icon"
                rel="noreferrer"
                target="_blank"
              >
                <FontAwesomeIcon icon={faTwitch} />
              </a>
              <a
                href="https://facebook.com/vocodes"
                className="footer-social-icon"
                rel="noreferrer"
                target="_blank"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a
                href="https://twitter.com/intent/follow?screen_name=FakeYouApp"
                className="footer-social-icon"
                rel="noreferrer"
                target="_blank"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container d-flex flex-column flex-md-row text-center text-md-start gap-3">
            <div className="flex-grow-1">
              Copyright &copy; 2020 &mdash; 2023 Learning Machines, Inc. (makers
              of FakeYou)
            </div>

            <GitSha />
          </div>
        </div>
      </footer>
    </>
  );
}

export { Footer };
