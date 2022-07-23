import React, { useState } from "react";
import { ApiConfig } from "@storyteller/components";
import { SessionTtsModelUploadResultListFc } from "../_common/SessionTtsModelUploadResultsListFc";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { TtsModelUploadJob } from "@storyteller/components/src/jobs/TtsModelUploadJobs";
import { DiscordLink } from "@storyteller/components/src/elements/DiscordLink";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { BackLink } from "../_common/BackLink";
import { FrontendUrlConfig } from "../../../common/FrontendUrlConfig";
import { distance, delay, duration } from "../../../data/animation";
const Fade = require("react-reveal/Fade");

interface Props {
  sessionWrapper: SessionWrapper;
  enqueueTtsModelUploadJob: (jobToken: string) => void;
  ttsModelUploadJobs: Array<TtsModelUploadJob>;
}

interface TtsModelUploadJobResponsePayload {
  success: boolean;
  job_token?: string;
}

function UploadTtsModelFc(props: Props) {
  let history = useHistory();

  const [downloadUrl, setDownloadUrl] = useState("");
  const [title, setTitle] = useState("");
  const [downloadUrlInvalidReason] = useState("");
  const [titleInvalidReason] = useState("");

  if (!props.sessionWrapper.isLoggedIn()) {
    return <div>You need to create an account or sign in.</div>;
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

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.uploadTts();

    let idempotencyToken = uuidv4();

    const request = {
      idempotency_token: idempotencyToken,
      title: title,
      download_url: downloadUrl,
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
      .then((res) => res.json())
      .then((res) => {
        let response: TtsModelUploadJobResponsePayload = res;

        if (!response.success || response.job_token === undefined) {
          return;
        }

        console.log("enqueuing...");

        props.enqueueTtsModelUploadJob(response.job_token);

        history.push("/");
      })
      .catch((e) => {
        //this.props.onSpeakErrorCallback();
      });

    return false;
  };

  return (
    <div>
      <div className="container pt-5 pb-4 px-md-4 px-lg-5 px-xl-3">
        <Fade bottom cascade duration={duration} distance={distance}>
          <div className="d-flex flex-column">
            <h1 className="display-5 fw-bold">Upload Voice (TTS Model)</h1>
            <h4>This works just like YouTube!</h4>
            <div className="my-3">
              <BackLink
                link={FrontendUrlConfig.contributePage()}
                text="Back to contribute page"
              />
            </div>
          </div>
        </Fade>
      </div>

      <Fade bottom duration={duration} distance={distance} delay={delay}>
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
      </Fade>

      <Fade bottom duration={duration} distance={distance} delay={delay}>
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
      </Fade>

      <form onSubmit={handleFormSubmit}>
        <Fade bottom duration={duration} distance={distance} delay={delay}>
          <div className="container-panel py-5">
            <div className="panel p-3 py-4 p-lg-4">
              <div className="d-flex flex-column gap-4">
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

                {/* 
        https://drive.google.com/file/d/{TOKEN}/view?usp=sharing
        */}
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

              {/*<div className="field is-grouped">
          <div className="control">
            <button className="button is-link is-large is-fullwidth">Upload</button>
          </div>
        </div>*/}
            </div>
          </div>

          <div className="container pb-5">
            <button className="btn btn-primary w-100">Upload</button>
          </div>
        </Fade>
      </form>

      <SessionTtsModelUploadResultListFc
        modelUploadJobs={props.ttsModelUploadJobs}
      />
    </div>
  );
}

export { UploadTtsModelFc };
