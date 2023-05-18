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
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../data/animation";
import { VoiceConversionModelUploadJob } from "@storyteller/components/src/jobs/VoiceConversionModelUploadJob";
import { SessionVoiceConversionModelUploadResultList } from "../../_common/SessionVoiceConversionModelUploadResultsList";

interface Props {
  sessionWrapper: SessionWrapper;
  enqueueVoiceConversionModelUploadJob: (jobToken: string) => void;
  voiceConversionModelUploadJobs: Array<VoiceConversionModelUploadJob>;
}

function UploadVoiceConversionModel(props: Props) {
  let history = useHistory();

  const [downloadUrl, setDownloadUrl] = useState("");
  const [title, setTitle] = useState("");
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

    let idempotencyToken = uuidv4();

    const request = {
      idempotency_token: idempotencyToken,
      title: title,
      download_url: downloadUrl,
      generic_download_type: "so_vits_svc",
    };

    const response = await EnqueueRemoteDownload(request);

    if (EnqueueRemoteDownloadIsOk(response)) {
      props.enqueueVoiceConversionModelUploadJob(response.job_token);
      history.push("/");
    }

    return false;
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pt-5 pb-3 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <motion.h1 className=" fw-bold" variants={item}>
            Upload Voice to Voice Model
          </motion.h1>
          <motion.h4 variants={item}>
            Transform your voice into another!
          </motion.h4>
          <motion.div className="my-3" variants={item}>
            <BackLink
              link={WebUrl.contributePage()}
              text="Back to contribute page"
            />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="container pt-3 d-flex flex-column gap-3 px-md-4 px-lg-5 px-xl-3"
        variants={item}
      >
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
      </motion.div>

      <motion.form onSubmit={handleFormSubmit} variants={panel}>
        <div className="container-panel py-5">
          <div className="panel p-3 py-4 p-lg-4">
            <div className="d-flex flex-column gap-4">
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
      </motion.form>

      <SessionVoiceConversionModelUploadResultList
        voiceConversionModelUploadJobs={props.voiceConversionModelUploadJobs}
      />
    </motion.div>
  );
}

export { UploadVoiceConversionModel };
