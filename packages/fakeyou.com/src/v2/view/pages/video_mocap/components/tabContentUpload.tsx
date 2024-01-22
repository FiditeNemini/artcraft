import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { UploadMedia } from "@storyteller/components/src/api/media_files/UploadMedia";
import { EnqueueVideoMotionCapture } from "@storyteller/components/src/api/video_mocap";
import { useFile } from "hooks";

import VideoInput from "components/common/VideoInput";

export default function TabContentUpload(props: {
  t: Function;
  pageStateCallback: (data: {
    tokenType: string;
    token: string | undefined;
  }) => void;
}) {
  const { t, pageStateCallback } = props;
  const videoProps = useFile({});
  enum tabStates {
    NO_FILE,
    FILE_STAGED,
    FILE_UPLOADING,
    FILE_UPLOADED,
    MOCAPNET,
  }
  const { NO_FILE, FILE_STAGED, FILE_UPLOADING, FILE_UPLOADED, MOCAPNET } =
    tabStates;
  const [tabState, setTabState] = useState<number>(NO_FILE);
  const [token, setToken] = useState<string>("");

  const makeRequest = () => ({
    uuid_idempotency_token: uuidv4(),
    file: videoProps.file,
    source: "file",
    type: "video",
  });

  const handleUploadVideo = () => {
    setTabState(FILE_UPLOADING);
    UploadMedia(makeRequest()).then(res => {
      if (res.success && "media_file_token" in res) {
        setToken(res.media_file_token);
      }
    });
  };
  useEffect(() => {
    if (token !== "") setTabState(FILE_UPLOADED);
  }, [token, FILE_UPLOADED]);

  const handleEnqueueMocapNet = () => {
    const request = {
      video_source: token,
      uuid_idempotency_token: uuidv4(),
    };
    EnqueueVideoMotionCapture(request).then(res => {
      pageStateCallback({
        tokenType: "jobToken",
        token: res.inference_job_token,
      });
    });
    setTabState(MOCAPNET);
  };
  // contains upload inout state and controls, see docs
  if (tabState === NO_FILE || tabState === FILE_STAGED) {
    return (
      <div>
        <div className="row">
          <div className="col-12">
            <VideoInput
              {...{
                t,
                ...videoProps,
                onStateChange: () =>
                  setTabState(videoProps.file ? FILE_STAGED : NO_FILE),
              }}
            />
          </div>
        </div>

        <div className="row py-3">
          <div className="col-12">
            <div className="d-flex justify-content-end gap-3">
              <button
                className="btn btn-primary"
                disabled={tabState !== FILE_STAGED}
                onClick={handleUploadVideo}
              >
                {t("button.upload")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (tabState === FILE_UPLOADING) {
    return (
      <div className="tab-pane fade show active py-4" id="vmcUpload">
        <div className="row">
          <div className="col-12">
            <h2>{t("tab.message.fileUploading")}</h2>
          </div>
        </div>
      </div>
    );
  } else if (tabState === FILE_UPLOADED) {
    return (
      <div className="tab-pane fade show active py-4" id="vmcUpload">
        <div className="row">
          <div className="col-12">
            <h2>{t("tab.message.fileUploaded")}</h2>
          </div>
          <div className="col-12">
            <button className="btn btn-primary" onClick={handleEnqueueMocapNet}>
              {t("button.generate")}
            </button>
          </div>
        </div>
      </div>
    );
  } else if (tabState === MOCAPNET) {
    return (
      <div className="tab-pane fade show active py-4" id="vmcUpload">
        <div className="row">
          <div className="col-12">
            <h2>{t("tab.message.mocapNetRequesting")}</h2>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="tab-pane fade show active py-4" id="vmcUpload">
        <div className="row">
          <div className="col-12">
            <h1>{t("message.UnknownError")}</h1>
          </div>
        </div>
      </div>
    );
  }
}
