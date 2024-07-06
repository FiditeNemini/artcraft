import React, { useState } from "react";
import { ApiConfig } from "@storyteller/components";
import { SessionTtsModelUploadResultList } from "../../_common/SessionTtsModelUploadResultsList";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { DiscordLink } from "@storyteller/components/src/elements/DiscordLink";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { BackLink } from "../../_common/BackLink";
import { Link } from "react-router-dom";
import { WebUrl } from "../../../../common/WebUrl";
import { useInferenceJobs } from "hooks";

import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import MentionsSection from "components/common/MentionsSection";
import StorytellerStudioCTA from "components/common/StorytellerStudioCTA";
import { Container } from "components/common";

interface Props {
  sessionWrapper: SessionWrapper;
}

interface TtsModelUploadJobResponsePayload {
  success: boolean;
  job_token?: string;
}

function UploadTtsModelPage(props: Props) {
  let history = useHistory();
  const { enqueueInferenceJob } = useInferenceJobs();

  PosthogClient.recordPageview();

  const [downloadUrl, setDownloadUrl] = useState("");
  const [title, setTitle] = useState("");
  const [modelType, setModelType] = useState("tacotron2"); // valid options: tacotron2, vits

  // Form errors
  const [downloadUrlInvalidReason] = useState("");
  const [titleInvalidReason] = useState("");

  if (!props.sessionWrapper.isLoggedIn()) {
    return (
      <div className="container py-5">
        <div className="py-5">
          <h1 className="fw-semibold text-center mb-4">
            You need to create an account or log in.
          </h1>
          <div className="d-flex gap-3 justify-content-center">
            <Link className="btn btn-secondary" to="/login">
              Login
            </Link>
            <Link className="btn btn-primary" to="/signup">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadUrlChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const downloadUrlValue = (ev.target as HTMLInputElement).value;
    setDownloadUrl(downloadUrlValue);
    return false;
  };

  const handleTitleChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const titleValue = (ev.target as HTMLInputElement).value;
    setTitle(titleValue);
    return false;
  };

  const handleModelTypeChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setModelType((ev.target as HTMLSelectElement).value);
  };

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.uploadTts();

    let idempotencyToken = uuidv4();

    const request = {
      idempotency_token: idempotencyToken,
      title: title,
      download_url: downloadUrl,
      tts_model_type: modelType,
    };

    fetch(endpointUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(request),
    })
      .then(res => res.json())
      .then(res => {
        let response: TtsModelUploadJobResponsePayload = res;

        if (!response.success || response.job_token === undefined) {
          return;
        }

        console.log("enqueuing...");

        enqueueInferenceJob(
          response.job_token,
          FrontendInferenceJobType.TextToSpeech
        );

        history.push("/");
      })
      .catch(e => {
        //this.props.onSpeakErrorCallback();
      });

    return false;
  };

  return (
    <div>
      <div className="container pt-5 pb-4 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <h1 className=" fw-bold">Upload Voice (TTS Model)</h1>
          <h4>This works just like YouTube!</h4>
          <div className="my-3">
            <BackLink
              link={WebUrl.contributePage()}
              text="Back to contribute page"
            />
          </div>
        </div>
      </div>

      <div className="container px-md-4 px-lg-5 px-xl-3">
        <div className="alert alert-primary">
          <strong>Content Creator Rewards!</strong>
          {/*<p>You can help FakeYou grow by uploading Tacotron2 models. 
        The person that uploads the most models will get $100, 
        the person that uploads the most popular model will get $100,
        and a number of other lucky winners will be chosen at random to 
        recieve cash prizes. Uploaders will also get queue priority!</p>*/}
          <div>
            As you upload and help us grow, you'll earn unique perks such as
            featured roles in Discord, queue priority, and more!
          </div>
        </div>
      </div>

      <div className="container pt-3 d-flex flex-column gap-3 px-md-4 px-lg-5 px-xl-3">
        <p>
          If you're new to voice cloning, join our{" "}
          <span>
            <DiscordLink />
          </span>{" "}
          to get started. We have a friendly community that can help you start
          creating your own voices of your favorite characters.
        </p>

        {/* TODO TEMP (2022-03-08) <p>
        FakeYou currently supports <em>Tacotron 2</em>, GlowTTS, and a custom synthesizer architecture 
        that we intend to open source. We'll soon add TalkNet, custom vocoder uploads, and more model 
        architectures.
      </p>*/}

        <p>
          Once your voice is successfully uploaded, you'll be able to start
          using it and sharing it with others. You'll also be able to edit the
          title, tags, and vocoder used, so don't worry if you typo something.
        </p>

        {/* TODO TEMP (2022-03-08) <p>
        Please do not upload voices that you didn't train yourself or voices of individuals
        who wish to not be voice cloned. We'll post a list of banned voices soon.
      </p>*/}
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="container-panel py-5">
          <div className="panel p-3 py-4 p-lg-4">
            <div className="d-flex flex-column gap-4">
              {/* Model Type */}
              <div>
                <label className="sub-title">TTS Model Type</label>
                <div className="control select">
                  <select
                    className="form-select"
                    name="tts_model_type"
                    onChange={handleModelTypeChange}
                    value={modelType}
                  >
                    <option value="tacotron2">Tacotron 2</option>
                    <option value="vits">VITS</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="sub-title">
                  Title, eg. "Goku (Sean Schemmel)"
                </label>
                <div className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={handleTitleChange}
                  />
                </div>
                <p className="help">{titleInvalidReason}</p>
              </div>

              {/* Download URL */}
              <div>
                <label className="sub-title">
                  Download URL, eg. Google Drive link
                </label>
                <div className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Download URL"
                    value={downloadUrl}
                    onChange={handleDownloadUrlChange}
                  />
                </div>
                <p className="help">{downloadUrlInvalidReason}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container pb-5">
          <button className="btn btn-primary w-100">Upload</button>
        </div>
      </form>

      <SessionTtsModelUploadResultList />

      <Container type="panel" className="py-5 mt-5 d-flex flex-column gap-5">
        <MentionsSection />
        <StorytellerStudioCTA />
      </Container>
    </div>
  );
}

export { UploadTtsModelPage };
