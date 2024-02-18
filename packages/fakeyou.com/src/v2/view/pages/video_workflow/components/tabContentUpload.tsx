import React from "react";
import { Redirect } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { UploadMedia } from "@storyteller/components/src/api/media_files/UploadMedia";
import { useFile } from "hooks";
import { ErrorMessage, VideoInput, Spinner } from "components/common";
import { states, Action, State } from "../videoWorkflowReducer";

export default function TabContentUpload({
  debug=false, t, pageState, dispatchPageState
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}) {
  const videoProps = useFile({});
  const {NO_FILE, FILE_STAGED, FILE_SELECTED, FILE_UPLOADING, FILE_UPLOADED} = states;

  const makeVideoUploadRequest = () => ({
    uuid_idempotency_token: uuidv4(),
    file: videoProps.file,
    source: "file",
    type: "video",
  });

  const handleUploadVideo = () => {
    dispatchPageState({type: 'uploadFile'});
    UploadMedia(makeVideoUploadRequest()).then(res => {
      if (res.success && res.media_file_token) {
        dispatchPageState({
          type: 'uploadFileSuccess', 
          payload:{
            mediaFileToken :res.media_file_token
          }
        })
      }
    });
  };

  // contains upload inout state and controls, see docs
  if (pageState.status === NO_FILE 
    || pageState.status === FILE_STAGED
    || pageState.status === FILE_SELECTED
  ) {
    return (
      <>
        <div className="row">
          <div className="col-12">
            <VideoInput
              {...{
                t,
                ...videoProps,
                onStateChange: () =>{
                  if (pageState.status === NO_FILE && videoProps.file)
                    dispatchPageState({type: "stagedFile"})
                  else if (pageState.status === FILE_STAGED && !videoProps.file)
                    dispatchPageState({type: "clearedFile"})
                }
              }}
            />
          </div>
        </div>

        <div className="row py-3">
          <div className="col-12">
            <div className="d-flex justify-content-end gap-3">
              <button
                className="btn btn-primary"
                disabled={pageState.status !== FILE_STAGED}
                onClick={handleUploadVideo}
              >
                {t("button.upload")}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }else if (pageState.status === FILE_UPLOADING){
    return(
      <div className="row">
        <div className="col-12">
          <h1>{t("message.fileUploading")}</h1>
        </div>
        <div className="col-12">
          <Spinner />
        </div>
      </div>
    );
  }else if (pageState.status === FILE_UPLOADED){
    return(
      <Redirect to={`load/${pageState.mediaFileToken}`}/>
    )
  }
  return <ErrorMessage />;
}
