import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import { Button, Panel } from "components/common";
import React from "react";
import LandingDemo from "../../fakeyou/LandingDemo/FakeYouLandingDemo";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";

interface TtsDemoSectionProps {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  inferenceJobs: Array<InferenceJob>;
  ttsInferenceJobs: Array<TtsInferenceJob>;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
  enqueueTtsJob: (jobToken: string) => void;
}

export default function TtsDemoSection(props: TtsDemoSectionProps) {
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
          <LandingDemo
            sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
            showHanashi={false}
            autoFocusTextBox={false}
          />
        </div>
      </div>
    </Panel>
  );
}
