import React, { useRef, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useParams, useHistory } from "react-router-dom";

import EnqueueVideoStyleTransfer from "@storyteller/components/src/api/video_styleTransfer";
import { Action, State } from "../../reducer";
import { TableOfKeyValues } from "../../commons";
import ivs from "./initialValues";
import {
  isInputValid,
  mapRequest,
  WorkflowValuesType,
} from "./helpers";

import {
  Button,
  Label,
  NumberSliderV2,
  Panel,
  SelectModal,
  TextArea,
  VideoFakeyou
} from "components/common";

export default function PageVSTApp({
  debug, t, pageState, dispatchPageState, parentPath
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  parentPath: string;
  dispatchPageState: (action: Action) => void;
}) {
  const { mediaToken } = useParams<any>();

  const [workflowValues, setWorkflowValues] = useState<WorkflowValuesType>({
    fileToken: pageState.mediaFileToken || mediaToken,
    ...ivs
  });

  const [styleStrength, setStyleStrength]= useState<number>(8);

  const videoRef = useRef<HTMLVideoElement>(null);

  if(videoRef?.current){
    if(debug) console.log("set-up video element listeners");
    const ve = videoRef.current
    ve.onloadedmetadata = () =>{
      if (ve.videoWidth && ve.videoHeight) {
        const aspectRatio = ve.videoWidth/ve.videoHeight
        if (aspectRatio > 1){
          handleOnChange("width",960);
        }
        else if (aspectRatio < 1) {
          handleOnChange("height",960);
        }else{
          if (debug) console.log(`aspectRaio: ${aspectRatio}`);
        }
      }
      if(ve.duration){
        handleOnChange("maxFrames", 
          Math.floor(ve.duration)*workflowValues.inputFps
        );
      }
      //TODO: Optimizer to make ONE handleOnChange only
      //TODO: deal with maxFrames with more reliable math
    }
  }


  const handleOnChange = (key: string, newValue:any,) => {
    setWorkflowValues((curr)=>({...curr, [key]: newValue}));
  }

  const handleStyleStrength = (value:number)=>{
    setStyleStrength(value);
  };
  const history = useHistory();
  const handleGenerate = ()=>{
    if(debug) console.log(workflowValues)

    if (isInputValid(workflowValues)){
      const request = mapRequest(workflowValues);
      if (debug) console.log(request);
      EnqueueVideoStyleTransfer(request).then(res => {
        if (res.success && res.inference_job_token) {
          dispatchPageState({
            type: 'enqueueJobSuccess',
            payload: {
              inferenceJobToken: res.inference_job_token
            }
          })
        }else{
          console.log(res);
        }
      })
      dispatchPageState({type: 'enqueueJob'})
      history.push(`${parentPath}/jobs`);
    }else{
      alert("you must pick an sd weight and input a prompt");
    }
  }

  return(
    <Panel className="mb-4 p-4">
      <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <VideoFakeyou
              label={t("video.label.original")}
              mediaToken={workflowValues.fileToken}
              ref={videoRef}
            />
          </div>
          <div className="col-12 col-md-6">
            <Label label={t("image.label.preview")}/>
            {debug && <TableOfKeyValues keyValues={workflowValues} height={400}/>}
          </div>
      </div>
      <div className="row g-3  mb-4">
        <div className="col-12 col-md-6">
          <SelectModal 
            modalTitle={t("modal.title.selectStyle")}
            label={t("input.label.selectStyle")}
            onSelect={({token})=>{
              handleOnChange("sdModelToken", token);
            }}
            tabs={[
              {
                label: "All Weights",
                tabKey: "allWeights",
                typeFilter: "sd_1.5",
                searcher: true,
                type: "weights",
              },
              {
                label: "Bookmarked",
                tabKey: "bookmarkedWeights",
                typeFilter: "sd_1.5",
                searcher: false,
                type: "weights",
              },
            ]}
          />
          <br/>
          <NumberSliderV2 {...{
            min: 1, max: 10, step: 1,
            initialValue: styleStrength,
            label: t("input.label.styleStrength"),
            thumbTip: t("input.thumbtip.styleStrength"),
            withRevert:true,
            onChange: handleStyleStrength
          }}/>
        </div>
        <div className="col-12 col-md-6">
          <TextArea
            {...{
              label: t("input.label.prompt"),
              placeholder: t("input.placeholder.prompt"),
              onChange: (e:React.ChangeEvent<HTMLTextAreaElement>)=>handleOnChange("posPrompt", e.target.value),
              value: workflowValues.posPrompt,
              required: false,
            }}
          />
          <br/>
          <br/>
          <TextArea
          {...{
            label: t("input.label.negPrompt"),
            placeholder: t("input.placeholder.negPrompt"),
            onChange: (e:React.ChangeEvent<HTMLTextAreaElement>)=>handleOnChange("negPrompt", e.target.value),
            value: workflowValues.negPrompt,
            required: false,
          }}
          />
        </div>
      </div>
      <div className="row g-3">
        <div className="col-12 d-flex justify-content-between">
          <NavLink to={`${parentPath}`}>
            <Button
              label={t("button.cancel")}
              // onClick={handleGenerate}
              variant="primary"
            />
          </NavLink>
          <Button
            label={t("button.enqueue")}
            onClick={handleGenerate}
            variant="primary"
          />
        </div>
      </div>
    </Panel>
  );
};