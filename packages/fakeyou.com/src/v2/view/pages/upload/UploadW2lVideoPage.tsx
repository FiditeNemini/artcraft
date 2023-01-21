import React, { useState } from "react";
import { ApiConfig } from "@storyteller/components";
import { SessionW2lTemplateUploadResultList } from "../../_common/SessionW2lTemplateUploadResultsList";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { W2lTemplateUploadJob } from "@storyteller/components/src/jobs/W2lTemplateUploadJobs";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { BackLink } from "../../_common/BackLink";
import { FrontendUrlConfig } from "../../../../common/FrontendUrlConfig";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../data/animation";

interface W2lTemplateUploadJobResponsePayload {
  success: boolean;
  job_token?: string;
}

interface Props {
  sessionWrapper: SessionWrapper;
  enqueueW2lTemplateUploadJob: (jobToken: string) => void;
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>;
}

function UploadW2lVideoPage(props: Props) {
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
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pt-5 pb-3 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <motion.h1 className="display-5 fw-bold" variants={item}>
            Upload Video (w2l template)
          </motion.h1>
          <motion.div className="my-3" variants={item}>
            <BackLink
              link={FrontendUrlConfig.contributePage()}
              text="Back to contribute page"
            />
          </motion.div>
        </div>
      </div>

      <motion.div className="container px-md-4 px-lg-5 px-xl-3" variants={item}>
        <p>
          The videos you upload can be used for lipsyncing with audio using the
          Wav2Lip model.
        </p>
      </motion.div>

      <motion.form onSubmit={handleFormSubmit} variants={panel}>
        <div className="container-panel py-5">
          <div className="panel p-3 py-4 p-lg-4">
            <div className="d-flex flex-column gap-4">
              <div>
                <label className="sub-title">
                  Title, eg. "Morshu tells you things"
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
          </div>
        </div>

        <motion.div className="container pb-5" variants={item}>
          <button className="btn btn-primary w-100">Upload</button>
        </motion.div>

        {/*<div className="field is-grouped">
          <div className="control">
            <button className="button is-link is-large is-fullwidth">Upload</button>
          </div>
        </div>*/}
      </motion.form>

      <SessionW2lTemplateUploadResultList
        w2lTemplateUploadJobs={props.w2lTemplateUploadJobs}
      />
    </motion.div>
  );
}

export { UploadW2lVideoPage };
