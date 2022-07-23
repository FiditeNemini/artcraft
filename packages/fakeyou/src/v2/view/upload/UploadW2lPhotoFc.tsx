import React, { useState } from "react";
import { ApiConfig } from "@storyteller/components";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { W2lTemplateUploadJob } from "@storyteller/components/src/jobs/W2lTemplateUploadJobs";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { SessionW2lTemplateUploadResultListFc } from "../_common/SessionW2lTemplateUploadResultsListFc";
import { BackLink } from "../_common/BackLink";
import { FrontendUrlConfig } from "../../../common/FrontendUrlConfig";
import { distance, delay, duration } from "../../../data/animation";
const Fade = require("react-reveal/Fade");

interface W2lTemplateUploadJobResponsePayload {
  success: boolean;
  job_token?: string;
}

interface Props {
  sessionWrapper: SessionWrapper;
  enqueueW2lTemplateUploadJob: (jobToken: string) => void;
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>;
}

function UploadW2lPhotoFc(props: Props) {
  let history = useHistory();

  const [downloadUrl, setDownloadUrl] = useState("");
  const [title, setTitle] = useState("");
  const [downloadUrlInvalidReason] = useState("");
  const [titleInvalidReason] = useState("");

  if (!props.sessionWrapper.isLoggedIn()) {
    history.push("/signup");
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
    const endpointUrl = api.uploadW2l();

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
        let response: W2lTemplateUploadJobResponsePayload = res;

        if (!response.success || response.job_token === undefined) {
          return;
        }

        console.log("enqueuing...");

        props.enqueueW2lTemplateUploadJob(response.job_token);
        history.push("/");
      })
      .catch((e) => {
        //this.props.onSpeakErrorCallback();
      });

    return false;
  };

  return (
    <div>
      <div className="container pt-5 pb-3 px-md-4 px-lg-5 px-xl-3">
        <Fade bottom cascade duration={duration} distance={distance}>
          <div className="d-flex flex-column">
            <h1 className="display-5 fw-bold"> Upload Photo (w2l template) </h1>
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
          <p>
            The photos you upload can be used for lipsyncing with audio using
            the Wav2Lip model. In the future, you'll be able to use these for
            first-order-model and much more!
          </p>
        </div>
      </Fade>

      <form onSubmit={handleFormSubmit}>
        <Fade bottom duration={duration} distance={distance} delay={delay}>
          <div className="container-panel py-5">
            <div className="panel p-3 py-4 p-lg-4">
              <div className="d-flex flex-column gap-4">
                <div>
                  <label className="sub-title">
                    Title, eg. "Dr. Phil stares into your soul"
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
                    Download URL, eg.{" "}
                    <code>https://i.imgur.com/lKaQ4Er.jpg</code>
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

          {/*<div className="field is-grouped">
          <div className="control">
            <button className="button is-link is-large is-fullwidth">Upload</button>
          </div>
        </div>*/}
        </Fade>
      </form>

      <SessionW2lTemplateUploadResultListFc
        w2lTemplateUploadJobs={props.w2lTemplateUploadJobs}
      />
    </div>
  );
}

export { UploadW2lPhotoFc };
