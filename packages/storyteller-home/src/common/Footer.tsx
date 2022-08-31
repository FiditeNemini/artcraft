import React from "react";
import { GitSha } from "@storyteller/components/src/elements/GitSha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faFacebook,
  faPatreon,
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
              <a href="https://google.com" className="footer-social-icon">
                <FontAwesomeIcon icon={faDiscord} />
              </a>
              <a href="https://google.com" className="footer-social-icon">
                <FontAwesomeIcon icon={faTwitch} />
              </a>
              <a href="https://google.com" className="footer-social-icon">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="https://google.com" className="footer-social-icon">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://google.com" className="footer-social-icon">
                <FontAwesomeIcon icon={faPatreon} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container d-flex">
            <div className="flex-grow-1">
              Copyright &copy; 2020 &mdash; 2022 Learning Machines, Inc. (makers
              of FakeYou and Storyteller)
            </div>

            <GitSha />
          </div>
        </div>
      </footer>
    </>
  );
}

export { Footer };
