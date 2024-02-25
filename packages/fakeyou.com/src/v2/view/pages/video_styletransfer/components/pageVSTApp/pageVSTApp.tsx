import React, { useRef, useState } from "react";
import { NavLink } from 'react-router-dom';
import { useParams, useHistory } from "react-router-dom";

import {
  Button,
  Label,
  Panel,
  NumberSliderV2,
  TextArea,
  VideoFakeyou
} from "components/common";

import EnqueueVideoStyleTransfer from "@storyteller/components/src/api/video_styleTransfer";
import { Action, State } from "../../reducer";
import { TableOfKeyValues } from "../../commons";
import { initialValues } from "./defaultValues";
import {
  mapRequest,
  WorkflowValuesType,
} from "./helpers";
import SectionAdvanceOptions from "./sectionAdvanceOptions";



export default function PageVSTApp({
  debug, t, pageState, dispatchPageState, parentPath
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  parentPath: string;
  dispatchPageState: (action: Action) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { mediaToken } = useParams<any>();

  const [workflowValues, setWorkflowValues] = useState<WorkflowValuesType>({
    fileToken: pageState.mediaFileToken || mediaToken,
    ...initialValues
  });


  if(videoRef?.current){
    if(debug) console.log("set-up video element listeners");
    const ve = videoRef.current
    ve.onloadedmetadata = () =>{
      const newValues : {
        width?: number;
        height?: number;
        maxFrames?: number;
        framesCap?: number;
      } = {};
      if (ve.videoWidth && ve.videoHeight) {
        const aspectRatio = ve.videoWidth/ve.videoHeight
        if (aspectRatio > 1) newValues.width = 960;
        else if (aspectRatio < 1) newValues.height = 960
        else if (debug) console.log(`aspectRaio: ${aspectRatio}`);
      }
      if(ve.duration){
        newValues.maxFrames = Math.floor(ve.duration)*workflowValues.inputFps;
        newValues.framesCap =  newValues.maxFrames;
      }
      setWorkflowValues((curr)=>({
        ...curr,
        ...newValues,
      }))
    }
  }


  const handleOnChange = (val:{[key: string]: number|string|boolean|undefined}) => {
    setWorkflowValues((curr)=>({...curr, ...val}));
  }
  

  const history = useHistory();
  const handleGenerate = ()=>{
    if(debug) console.log(workflowValues)

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
  }

  return(
    <Panel className="mb-4 p-4">
      <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <VideoFakeyou
              label={t("video.label.original")}
              mediaToken={workflowValues.fileToken}
              ref={videoRef}
              onResponse={(res)=>{
                dispatchPageState({
                  type: 'loadFileSuccess',
                  payload: {
                    mediaFile: res,
                    mediaFileToken: pageState.mediaFileToken || mediaToken
                  }
                });
              }}
            />
          </div>
          <div className="col-12 col-md-6">
            <Label label={t("image.label.preview")}/>
            {debug && <TableOfKeyValues keyValues={workflowValues} height={400}/>}

          </div>
      </div>
      <div className="row g-3  mb-4">
        <div className="col-12 col-md-6">
          <TextArea
          {...{
            label: t("input.label.prompt"),
            placeholder: t("input.placeholder.prompt"),
            onChange: (e:React.ChangeEvent<HTMLTextAreaElement>)=>handleOnChange({posPrompt: e.target.value}),
            value: workflowValues.posPrompt,
            required: false,
          }}
          />
        </div>
        <div className="col-12 col-md-6">
          <TextArea
          {...{
            label: t("input.label.negPrompt"),
            placeholder: t("input.placeholder.negPrompt"),
            onChange: (e:React.ChangeEvent<HTMLTextAreaElement>)=>handleOnChange({negPrompt: e.target.value}),
            value: workflowValues.negPrompt,
            required: false,
          }}
          />
        </div>
      </div>
      <div className="row g-3  mb-4">
        <div className="col-12 col-md-6">
          <NumberSliderV2 {...{
            min: 1, max: 60, step: 1,
            initialValue: workflowValues.inputFps,
            label: "Input FPS",
            thumbTip: "Input FPS",
            onChange: (val)=>{handleOnChange({inputFps: val})}
            }}/>
        </div>
      </div>
      <div className="row g-3 mt-4">
        <SectionAdvanceOptions 
          onChange={handleOnChange}
          workflowValues={workflowValues}
        />
      </div>
      <div className="row g-3 mt-4">
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