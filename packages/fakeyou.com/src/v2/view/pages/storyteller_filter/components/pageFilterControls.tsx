import React from "react";
import { useMedia } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { states, Action, State } from "../storytellerFilterReducer";
import { BasicVideo, ErrorMessage, Panel, Spinner } from "components/common";

export default function PageFilterControls({
  debug=false, t, pageState, dispatchPageState
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}) {
  useMedia({
    mediaToken: pageState.mediaFileToken,
    onSuccess: (res: any) => {
      // ratings.gather({ res, key: "token" });
      console.log(res)
      dispatchPageState({
        type: 'loadFileSuccess',
        payload: {mediaFile: res}
      })
    },
  });

  if (pageState.mediaFile){
    const mediaLink = new BucketConfig().getGcsUrl(pageState.mediaFile.public_bucket_path);
    if (mediaLink)
      return(
        <Panel>
          <div className="row g-3 p-3">
            {/* <h1>{t("message.fileUploaded")}</h1> */}
            {debug && <p>{`File Token: ${pageState.mediaFileToken}`}</p> }
            <div className="col-6">
              <BasicVideo src={mediaLink} />
            </div>
            <div className="col-6">
              <BasicVideo src={mediaLink} />
            </div>
          </div>
        </Panel>
      );
  }else if (pageState.status <= states.FILE_LOADING){
    return (
      <Panel>
        {debug && <p>{`File Token: ${pageState.mediaFileToken}`}</p> }
        <p>Loading Files</p>
        <Spinner />
      </Panel>
    );
  }
  return <ErrorMessage />;
}