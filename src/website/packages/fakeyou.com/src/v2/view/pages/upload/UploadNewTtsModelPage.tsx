import React, { useState } from "react";
import { SessionTtsModelUploadResultList } from "../../_common/SessionTtsModelUploadResultsList";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { BackLink } from "../../_common/BackLink";
import { Link } from "react-router-dom";
import { WebUrl } from "../../../../common/WebUrl";
import { useInferenceJobs } from "hooks";

import { EnqueueGsvModelDownload } from "@storyteller/components/src/api/model_downloads/EnqueueGsvModelDownload";

interface Props {
  sessionWrapper: SessionWrapper;
}

function UploadNewTtsModelPage(props: Props) {
  let history = useHistory();
  const { enqueueInferenceJob } = useInferenceJobs();

  const [downloadUrl, setDownloadUrl] = useState("");
  const [title, setTitle] = useState("");

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

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    await EnqueueGsvModelDownload("", {
      uuid_idempotency_token: uuidv4(),
      download_url: downloadUrl,
      maybe_title: title,
      //maybe_description?: string;
      //maybe_cover_image_media_file_token?:	string;
      //creator_set_visibility?:	string;
    }).then((res: any) => {
      if (res && res.success) {
        enqueueInferenceJob(
          res.job_token,
          FrontendInferenceJobType.TextToSpeech
        );
        history.push("/");
      }
    });

    return false;
  };

  return (
    <div>
      <div className="container pt-5 pb-4 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <h1 className=" fw-bold">Upload TTS Model</h1>
          <div className="my-3">
            <BackLink
              link={WebUrl.contributePage()}
              text="Back to contribute page"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="container-panel py-5">
          <div className="panel p-3 py-4 p-lg-4">
            <div className="d-flex flex-column gap-4">
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
    </div>
  );
}

export { UploadNewTtsModelPage };
