import React from 'react';
import { v4 as uuidv4 } from "uuid";

import { EnqueueVideoMotionCapture } from "@storyteller/components/src/api/video_mocap";

import { states, Action, State } from "../videoMocapReducer";
import { Spinner } from 'components/common/';

export default function PageVideoMocapProgress ({t, pageState, dispatchPageState}: {
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}){
  const {FILE_UPLOADING, FILE_UPLOADED, MOCAPNET_ENQUEUEING} = states;

  const handleEnqueueMocapNet = () => {
    if (pageState.mediaFileToken){
      const request = {
        video_source: pageState.mediaFileToken,
        uuid_idempotency_token: uuidv4(),
      };
      EnqueueVideoMotionCapture(request).then(res => {
        if(res.success && res.inference_job_token ){
          dispatchPageState({
            type: 'enqueueMocapNetSuccess',
            payload:{
              inferenceJobToken: res.inference_job_token,
            }
          });
        }
      });
      dispatchPageState({type: 'enqueueMocapNet'})
    }
  };
  
  if (pageState.status === FILE_UPLOADING) {
    return (
        <div className="row p-4 g-4">
          <div className="col-12 d-flex justify-content-center">
            <h2>{t("tab.message.fileUploading")}</h2>
            <Spinner />
          </div>
        </div>
    );
  } else if (pageState.status === FILE_UPLOADED) {
    return (
        <div className="row p-4 g-4">
          <div className="col-12 d-flex justify-content-center">
            <h2>{t("tab.message.fileUploaded")}</h2>
          </div>
          <div className="col-12 d-flex justify-content-center">
            <button className="btn btn-primary" onClick={handleEnqueueMocapNet}>
              {t("button.generate")}
            </button>
          </div>
        </div>
    );
  } else if (pageState.status === MOCAPNET_ENQUEUEING) {
    return (
        <div className="row p-4 g-4">
          <div className="col-12 d-flex justify-content-center">
            <h2>{t("tab.message.mocapNetRequesting")}</h2>
          </div>
          <div className="col-12 d-flex justify-content-center">
            <Spinner />
          </div>
        </div>
    );
  }
  return(
    <div className="row p-4 g-4">
      <div className="col-12 d-flex justify-content-center">
        <h2>{t("message.UnknownError")}</h2>
      </div>
    </div>
  );
}