import React, {useState, useRef} from "react";
import { useParams, useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMedia } from "hooks";

import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { EnqueueVideoWorkflow } from "@storyteller/components/src/api/video_workflow";
import { states, Action, State } from "../../videoWorkflowReducer";
import {
  Accordion,
  Button,
  BasicVideo,
  ErrorMessage,
  InputSeed,
  Panel,
  SelectModal,
  Spinner,
  TextArea
} from "components/common";

import SectionControlNets, {ControlNetsInitialValues as CnIvs} from "./sectionControlNets";
import SectionVideoSettings from "./sectionVideoSettings";
import SectionAdvanceOptions, {AdvanceOptionsInitialValues as AdvIvs} from "./sectionAdvanceOptions";
import { isInputValid } from "./helpers";

export default function PageFilterControls({
  debug, t, pageState, dispatchPageState, parentPath
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  parentPath: string;
  dispatchPageState: (action: Action) => void;
}) {
  const { mediaToken } = useParams<any>();
  const videoRef = useRef<HTMLVideoElement>(null);
  useMedia({
    mediaToken: pageState.mediaFileToken || mediaToken,
    onSuccess: (res: any) => {
      dispatchPageState({
        type: 'loadFileSuccess',
        payload: {
          mediaFile: res,
          mediaFileToken: pageState.mediaFileToken || mediaToken
        }
      });
    },
  });

  const [workflowValues, setworkflowValues] = useState({
    outputPath: "vid2vid/SparseUpscaleInterp_00001.mp4",
    workflowConfig: "weight_q8sz47gmfw2zx02snrbz88ns9",
    seed: "",
    sdModelToken: "",
    loraModelToken: "",
    posPrompt: "",
    negPrompt: "",
    framesCap:16,
    skipFrames:0,
    nthFrames:2,
    inputFps: 24,
    interpolationMutiplier: 2,
    ...AdvIvs,
    ...CnIvs
  });

  const handleOnChange = (key: string, newValue:any,) => {
    setworkflowValues((curr)=>({...curr, [key]: newValue}));
  }

  const history = useHistory();
  const handleGenerate = ()=>{
    if(debug) console.log(workflowValues)

    if (isInputValid(workflowValues)){
      const request = {
        "uuid_idempotency_token": uuidv4(),
        "maybe_sd_model": workflowValues.sdModelToken,
        "maybe_workflow_config": workflowValues.workflowConfig,
        "maybe_input_file": pageState.mediaFileToken || mediaToken,
        "maybe_output_path": workflowValues.outputPath,
        "maybe_json_modifications": {
          "$.510.inputs.Text": workflowValues.posPrompt,
          "$.8.inputs.text": workflowValues.negPrompt,
          "$.173.inputs.seed": workflowValues.seed,
          "$.401.inputs.Value": workflowValues.firstPass,
          "$.918.inputs.Value": workflowValues.motionScale,
          "$.137.inputs.Value": workflowValues.framesCap,
          "$.186.inputs.Value": workflowValues.skipFrames,
          "$.140.inputs.Value": workflowValues.nthFrames,
          "$.154.inputs.Value": workflowValues.inputFps,
          "$.445.inputs.number": workflowValues.interpolationMutiplier,
          "$.947.inputs.Value": workflowValues.cnTile,
          "$.800.inputs.Value": workflowValues.cnCanny,
          "$.797.inputs.Value": workflowValues.cnLinearAnime,
          "$.796.inputs.Value": workflowValues.cnLinearRealistic,
          "$.772.inputs.Value": workflowValues.cnDepth,
          "$.771.inputs.Value": workflowValues.cnOpenPose,
          "$.527.inputs.Value": workflowValues.cnPipeFace,
          "$.403.inputs.Value": workflowValues.cnSparse
        },
      }
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

  if (pageState.mediaFile){
    const mediaLink = new BucketConfig().getGcsUrl(pageState.mediaFile.public_bucket_path);

    if (mediaLink)
      return(
        <>
          <Panel>
            <div className="row g-3 p-3">
              <div className="col-5">
                <div className="fy-basic-video">
                  <video controls ref={videoRef}>
                    <source src={mediaLink} type="video/mp4"/>
                  </video>
                </div>
              </div>
              <div className="col-2 d-flex align-items-center justify-content-center">
                <FontAwesomeIcon icon={faChevronRight} className="fa-7x"/>
              </div>
              <div className="col-5">
                <BasicVideo src={mediaLink} />
              </div>
            </div>
          </Panel>
          <Accordion className="mt-4">
            <Accordion.Item title="Video Settings">
              <SectionVideoSettings
                onChange={(key,val)=>handleOnChange(key,val)}
                videoElement={videoRef?.current}
              />
            </Accordion.Item>
            <Accordion.Item title={"Basics"} defaultOpen>
              <div className="row g-3 p-3">
                <SelectModal 
                  modalTitle="Select a Stable Diffusion Weight"
                  label="Select a Stable Diffusion Weight"
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
              </div>
              <div className="row g-3 p-3">
                <SelectModal
                  modalTitle="Select a LoRA Weight"
                  label="Additional LoRA Weight"
                  onSelect={({token})=>{
                    console.log(`calling from select modal result select ${token}`);
                    handleOnChange("loraModelToken", token);
                  }}
                  tabs={[
                    {
                      label: "All LoRA Weights",
                      tabKey: "allLoraWeights",
                      typeFilter: "rvc_v2",
                      searcher: true,
                      type: "weights",
                    },
                    {
                      label: "Bookmarked",
                      tabKey: "bookmarkedLoraWeights",
                      typeFilter: "rvc_v2",
                      searcher: false,
                      type: "weights",
                    },
                  ]}
                />
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <TextArea
                    {...{
                      label: "Prompt",
                      placeholder: "Enter a prompt",
                      onChange: (e:React.ChangeEvent<HTMLTextAreaElement>)=>handleOnChange("posPrompt", e.target.value),
                      value: workflowValues.posPrompt,
                      required: false,
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <TextArea
                    {...{
                      label: "Negative Prompt",
                      placeholder: "Enter Negative Prompt",
                      onChange: (e:React.ChangeEvent<HTMLTextAreaElement>)=>handleOnChange("negPrompt", e.target.value),
                      value: workflowValues.negPrompt,
                      required: false,
                    }}
                  />
                </div>
              </div>
              <div className="row g-3 p-3">
                <InputSeed label="Seed" onChange={
                  (val:string)=>handleOnChange("seed", val)
                }/>
              </div>
              
            </Accordion.Item>
            <Accordion.Item title="Advance" defaultOpen>
              <SectionAdvanceOptions
                  workflowValues={workflowValues}
                  onChange={(key,val)=>handleOnChange(key,val)}
                />
            </Accordion.Item>
            <Accordion.Item title="Control Nets" defaultOpen>
              <SectionControlNets
                workflowValues={workflowValues}
                onChange={(key,val)=>handleOnChange(key,val)}
              />
            </Accordion.Item>
          </Accordion>
          <div className="row g-3 py-3">
            <div className="col-12 d-flex justify-content-end">
              <Button
                label={t("Process Filter")}
                onClick={handleGenerate}
                variant="primary"
              />
            </div>
          </div>
        </>
      );
  }else if (pageState.status <= states.FILE_LOADING){
    return (
      <Panel>
        <p>Loading Files</p>
        <Spinner />
      </Panel>
    );
  }
  return <ErrorMessage />;
}