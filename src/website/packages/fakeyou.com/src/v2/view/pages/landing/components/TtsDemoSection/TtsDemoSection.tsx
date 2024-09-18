import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import { Button, Panel } from "components/common";
import React from "react";
import LandingDemo from "../../fakeyou/LandingDemo/FakeYouLandingDemo";

export default function TtsDemoSection() {
  return (
    <Panel clear={true}>
      <div className="row g-4 section">
        <div className="col-12 col-lg-6 d-flex flex-column justify-content-center">
          <h1 className="fw-bold">Generate Text to Speech</h1>
          <p className="opacity-75 mb-0">
            Create audio of any character saying anything you want.
          </p>
          <div className="d-flex mt-4">
            <Button
              label="Try all 3000+ TTS Voices"
              icon={faArrowRight}
              iconFlip={true}
              to="/tts"
              small={true}
            />
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <LandingDemo showHanashi={false} autoFocusTextBox={false} />
        </div>
      </div>
    </Panel>
  );
}
