import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { DiscordLink } from "@storyteller/components/src/elements/DiscordLink";
import {
  EnqueueRemoteDownload,
  EnqueueRemoteDownloadIsOk,
} from "@storyteller/components/src/api/remote_downloads/EnqueueRemoteDownload";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { BackLink } from "../../_common/BackLink";
import { Link } from "react-router-dom";
import { WebUrl } from "../../../../common/WebUrl";

import { VoiceConversionModelUploadJob } from "@storyteller/components/src/jobs/VoiceConversionModelUploadJob";
import { SessionVoiceConversionModelUploadResultList } from "../../_common/SessionVoiceConversionModelUploadResultsList";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import MentionsSection from "components/common/MentionsSection";
import StorytellerStudioCTA from "components/common/StorytellerStudioCTA";
import { Container } from "components/common";

interface Props {
  sessionWrapper: SessionWrapper;
  enqueueVoiceConversionModelUploadJob: (jobToken: string) => void;
  voiceConversionModelUploadJobs: Array<VoiceConversionModelUploadJob>;
}

function UploadVoiceConversionModel(props: Props) {
  let history = useHistory();
  PosthogClient.recordPageview();

  const [downloadUrl, setDownloadUrl] = useState("");
  const [title, setTitle] = useState("");
  const [downloadUrlInvalidReason] = useState("");
  const [titleInvalidReason] = useState("");
  const [modelType, setModelType] = useState("so_vits_svc"); // valid options: "so_vits_svc", "rvc_v2"

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

  const handleModelTypeChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setModelType((ev.target as HTMLSelectElement).value);
  };

  const handleTitleChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const titleValue = (ev.target as HTMLInputElement).value;
    setTitle(titleValue);
    return false;
  };

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    let idempotencyToken = uuidv4();

    const request = {
      idempotency_token: idempotencyToken,
      title: title,
      download_url: downloadUrl,
      generic_download_type: modelType,
    };

    const response = await EnqueueRemoteDownload(request);

    if (EnqueueRemoteDownloadIsOk(response)) {
      props.enqueueVoiceConversionModelUploadJob(response.job_token);
      history.push("/");
    }

    return false;
  };

  return (
    <div>
      <div className="container pt-5 pb-3 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <h1 className=" fw-bold">Upload Voice to Voice Model</h1>
          <h4>Transform your voice into another!</h4>
          <div className="my-3">
            <BackLink
              link={WebUrl.contributePage()}
              text="Back to contribute page"
            />
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

        <p>
          Once your voice conversion model is successfully uploaded, you'll be
          able to use it from the main page. Others will be able to use it too,
          and you'll get credited.
        </p>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="container-panel py-5">
          <div className="panel p-3 py-4 p-lg-4">
            <div className="d-flex flex-column gap-4">
              {/* Model Type */}
              <div>
                <label className="sub-title">Voice-to-Voice Model Type</label>
                <div className="control select">
                  <select
                    className="form-select"
                    name="tts_model_type"
                    onChange={handleModelTypeChange}
                    value={modelType}
                  >
                    <option value="so_vits_svc">so-vits-svc</option>
                    <option value="rvc_v2">rvc (v2)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="sub-title">
                  Voice Conversion Title, eg. "Jim Varney", "Donald Trump", etc.
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

      <SessionVoiceConversionModelUploadResultList
        voiceConversionModelUploadJobs={props.voiceConversionModelUploadJobs}
      />

      <Container type="panel" className="py-5 mt-5 d-flex flex-column gap-5">
        <MentionsSection />
        <StorytellerStudioCTA />
      </Container>
    </div>
  );
}

export { UploadVoiceConversionModel };
