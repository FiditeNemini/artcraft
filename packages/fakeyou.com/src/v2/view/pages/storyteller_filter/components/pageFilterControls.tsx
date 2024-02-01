import React, {useState} from "react";
import { useParams } from "react-router-dom";

import { useMedia } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { states, Action, State } from "../storytellerFilterReducer";
import {
  BasicVideo,
  ErrorMessage,
  NumberSliderV2,
  Panel,
  Spinner,
  TextAreaV2
} from "components/common";

import { faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PageFilterControls({
  debug=false, t, pageState, dispatchPageState
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}) {
  const { mediaToken } = useParams<any>();

  useMedia({
    mediaToken: pageState.mediaFileToken || mediaToken,
    onSuccess: (res: any) => {
      // ratings.gather({ res, key: "token" });
      dispatchPageState({
        type: 'loadFileSuccess',
        payload: {mediaFile: res}
      })
    },
  });

  const [filterState, setFilterState] = useState({
    posPrompt: "",
    negPrompt: "",
    firstPass: 15,
    upScalePass: 15
  });

  const handleOnChange = (key: string, newValue:any,) => {
    setFilterState((curr)=>({...curr, [key]: newValue}));
  }

  if (pageState.mediaFile){
    const mediaLink = new BucketConfig().getGcsUrl(pageState.mediaFile.public_bucket_path);
    if (mediaLink)
      return(
        <>
        <Panel>
          <div className="row g-3 p-3">
            {/* <h1>{t("message.fileUploaded")}</h1> */}
            {debug && <p>{`File Token: ${pageState.mediaFileToken}`}</p> }
            <div className="col-5">
              <BasicVideo src={mediaLink} />
            </div>
            <div className="col-1 d-flex align-items-center justify-items-center">
              <FontAwesomeIcon icon={faChevronRight} className="fa-6x"/>
            </div>
            <div className="col-6">
              <BasicVideo src={mediaLink} />
            </div>
          </div>
        </Panel>
        <Panel className="mt-4">
          <div className="row g-3 p-3">
            <p>Select A Stable Diffusion Model</p>
            <br />
            <p>Select A LoRA</p>
            <TextAreaV2
              {...{
                label: "Prompt",
                placeholder: "Enter a prompt",
                onChange: (val:string)=>handleOnChange("posPrompt", val),
                value: filterState.posPrompt,
                required: false,
              }}
            />
            <TextAreaV2
              {...{
                label: "Negative Prompt",
                placeholder: "Enter Negative Prompt",
                onChange: (val:string)=>handleOnChange("negPrompt", val),
                value: filterState.negPrompt,
                required: false,
              }}
            />
          </div>
        </Panel>
        <Panel className="mt-4">
          <div className="row g-3 p-3">
            <NumberSliderV2 {...{
                min: 1,
                max: 30,
                step: 0.5,
                initialValue: filterState.firstPass,
                label: " Denoise First Pass",
                thumbTip: "Denoise First Pass",
                onChange: (val)=>{handleOnChange("firstPass",val)}
              }}/>
            <NumberSliderV2 {...{
              min: 1,
              max: 30,
              initialValue: filterState.upScalePass,
              label: "Denoise Upscale Pass",
              thumbTip: "Denoise Upscale Pass",
              onChange: (val)=>{handleOnChange("upScalePass", val)}
            }}/>
            <br />
          </div>
        </Panel>
        </>
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