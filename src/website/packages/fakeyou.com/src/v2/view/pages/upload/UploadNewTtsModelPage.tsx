import React, { useState } from "react";
import { SessionTtsModelUploadResultList } from "../../_common/SessionTtsModelUploadResultsList";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { BackLink } from "../../_common/BackLink";
import { Link } from "react-router-dom";
import { WebUrl } from "../../../../common/WebUrl";
import { useInferenceJobs, useSession } from "hooks";

import { EnqueueGsvModelDownload } from "@storyteller/components/src/api/model_downloads/EnqueueGsvModelDownload";
import { Button, Container, Input, Label, Panel } from "components/common";
import { faUpload } from "@fortawesome/pro-solid-svg-icons";

function UploadNewTtsModelPage() {
  const history = useHistory();
  const { sessionWrapper } = useSession();
  const { enqueueInferenceJob } = useInferenceJobs();

  const [downloadUrl, setDownloadUrl] = useState("");
  const [title, setTitle] = useState("");

  // Form errors
  const [downloadUrlInvalidReason] = useState("");
  const [titleInvalidReason] = useState("");

  if (!sessionWrapper.isLoggedIn()) {
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
      }
    });

    return false;
  };

  return (
    <Container type="panel" className="mt-5">
      <Panel clear={true}>
        <div className="d-flex flex-column">
          <h1 className=" fw-bold">Upload New TTS Model</h1>
          <div className="my-3">
            <BackLink
              link={WebUrl.contributePage()}
              text="Back to contribute page"
            />
          </div>
        </div>
      </Panel>

      <Panel padding={true}>
        <form onSubmit={handleFormSubmit}>
          <div className="d-flex flex-column gap-4 mb-4">
            {/* Title */}
            <div>
              <Label label='Title, eg. "Goku (Sean Schemmel)"' />
              <Input
                type="text"
                placeholder="Title"
                value={title}
                onChange={handleTitleChange}
              />
              <p className="help">{titleInvalidReason}</p>
            </div>

            {/* Download URL */}
            <div>
              <Label label="Download URL, eg. Google Drive link" />
              <Input
                type="text"
                placeholder="Download URL"
                value={downloadUrl}
                onChange={handleDownloadUrlChange}
              />
              {downloadUrlInvalidReason && (
                <p className="help">{downloadUrlInvalidReason}</p>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end w-100">
            <Button
              disabled={title === "" || !downloadUrl}
              label="Upload Model"
              icon={faUpload}
              type="submit"
            />
          </div>
        </form>
      </Panel>

      <div className="mt-5">
        <SessionTtsModelUploadResultList />
      </div>
    </Container>
  );
}

export { UploadNewTtsModelPage };
