import {
  faCameraMovie,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { Button, Container, Panel } from "components/common";
import React from "react";
import "./WaitlistNextSteps.scss";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { DiscordLink2 } from "@storyteller/components/src/elements/DiscordLink2";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";
import { TwitterLink } from "@storyteller/components/src/elements/TwitterLink";

interface WaitlistNextStepsPageProps {
  sessionWrapper: SessionWrapper;
}

export default function WaitlistNextStepsPage(props: WaitlistNextStepsPageProps) {
  const isLoggedIn = props.sessionWrapper.isLoggedIn();

  usePrefixedDocumentTitle("Next Steps");

  return (
    <Container type="panel">
      <Panel clear={true} className={`${!isLoggedIn ? "section" : "mt-4"}`}>
        <h1 className="fw-bold mb-4">
          <FontAwesomeIcon icon={faCameraMovie} className="me-3" />
          Join the Community
        </h1>

        <div className="d-flex flex-column gap-5">
          <div>
            <Panel padding={true} className="p-3 p-lg-4 rounded">
              <div className="row g-3 g-lg-4">
                <div className="col-6 col-lg-3">
                  <div className="w-100 h-100 rounded overflow-hidden">
                    <img
                      src="https://storage.googleapis.com/vocodes-public/media/f/0/g/9/c/f0g9c1pqpa10hf6hbd3j8m7yzn8njh58/storyteller_f0g9c1pqpa10hf6hbd3j8m7yzn8njh58.mp4-thumb.gif"
                      alt="Fox Video"
                      className="w-100 object-fit-cover"
                    />
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="w-100 h-100 rounded overflow-hidden">
                    <img
                      src="https://storage.googleapis.com/vocodes-public/media/0/r/n/v/w/0rnvwqf7g7chkp3v4vnq5mgp0b2gpqcq/storyteller_0rnvwqf7g7chkp3v4vnq5mgp0b2gpqcq.mp4-thumb.gif"
                      alt="Dinosaur Video"
                      className="w-100 object-fit-cover"
                    />
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="w-100 h-100 rounded overflow-hidden">
                    <img
                      src="https://storage.googleapis.com/vocodes-public/media/8/s/a/k/x/8sakxqt1gtg4vanccf56ca7w9ez6bxr2/storyteller_8sakxqt1gtg4vanccf56ca7w9ez6bxr2.mp4-thumb.gif"
                      alt="Girl Video"
                      className="w-100 object-fit-cover"
                    />
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="w-100 h-100 rounded overflow-hidden">
                    <img
                      src="https://storage.googleapis.com/vocodes-public/media/q/a/4/y/5/qa4y5dphdfvca3yqszp5wsqz5bzsce1n/videoqa4y5dphdfvca3yqszp5wsqz5bzsce1nmp4-thumb.gif"
                      alt="Portal Video"
                      className="w-100 object-fit-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex flex-column gap-3 flex-lg-row align-items-start align-items-lg-center mt-5">
                <div className="flex-grow-1">
                  <h1 className="fw-bold mb-2 display-5">Join our Discord!</h1>
                  <h5 className="fw-normal opacity-75">
                    The fastest way to stay up to date is to join our <DiscordLink2 />. 
                    You might even be able to get early access &mdash; just ask!
                  </h5>
                </div>

                <Button
                  label="Join our Discord!"
                  icon={faDiscord}
                  className="enter-storyteller-button"
                  href={ThirdPartyLinks.STORYTELLER_DISCORD}
                  />
              </div>
            </Panel>

            <br />

            <Panel padding={true} className="p-3 p-lg-4 rounded">
                <div className="flex-grow-1">
                  <h2 className="">Follow us, too!</h2>

                  <ul>
                    <li><TwitterLink /></li>
                  </ul>
                </div>
            </Panel>

          </div>
          {/*
          <div>
            <h2 className="fw-bold mb-3 mt-4">Video</h2>
            <DashboardRow items={[]} />
          </div>
          <div>
            <h2 className="fw-bold mb-3 mt-4">Voice & Audio</h2>
            <DashboardRow items={[]} />
          </div>
          */}
        </div>
      </Panel>
    </Container>
  );
}
