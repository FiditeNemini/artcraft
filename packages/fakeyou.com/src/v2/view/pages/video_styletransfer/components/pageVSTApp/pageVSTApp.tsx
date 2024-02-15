import React, { useRef, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useParams, useHistory } from "react-router-dom";

import { EnqueueVideoWorkflow } from "@storyteller/components/src/api/video_workflow";
import { states, Action, State } from "../../reducer";
import ivs from "./initialValues";
import {
  isInputValid,
  mapRequest,
  WorkflowValuesType,
  TableOfKeyValues
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

  const videoRef = useRef<HTMLVideoElement>(null);
  if(videoRef?.current){
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

  const mapStyleStrength = (value:number)=>{
    if(debug) console.log(`Style Strength: ${value}, it is not map to anything`)
  };
  const history = useHistory();
  const handleGenerate = ()=>{
    if(debug) console.log(workflowValues)

    if (isInputValid(workflowValues)){
      const request = mapRequest(workflowValues);
      if (debug) console.log(request);
      EnqueueVideoWorkflow(request).then(res => {
        if (res.success && res.inference_job_token) {
          dispatchPageState({
            type: 'enqueueFilterSuccess',
            payload: {
              inferenceJobToken: res.inference_job_token
            }
          })
        }else{
          console.log(res);
        }
      })
      dispatchPageState({type: 'enqueueFilter'})
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
            initialValue: workflowValues.upscaleMultiplier,
            label: t("input.label.styleStrength"),
            thumbTip: "24 frames = 1 sec",
            withRevert:true,
            onChange: (val)=>{handleOnChange("upscaleMultiplier",val)}
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
            label={t("button.enqueueWorkflow")}
            onClick={handleGenerate}
            variant="primary"
          />
        </div>
      </div>
    </Panel>
  );
};