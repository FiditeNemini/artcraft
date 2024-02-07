import React, {useState} from "react";
import { useParams, useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { faChevronRight } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMedia } from "hooks";

import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { EnqueueVideoWorkflow } from "@storyteller/components/src/api/video_workflow";
import { states, Action, State } from "../videoWorkflowReducer";
import {
  Accordion,
  Button,
  BasicVideo,
  Checkbox,
  ErrorMessage,
  Input,
  InputSeed,
  NumberSliderV2,
  Panel,
  SelectModal,
  Spinner,
  TextArea
} from "components/common";


export default function PageWorkflowControls({
  t, pageState, dispatchPageState, parentPath
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  parentPath: string;
  dispatchPageState: (action: Action) => void;
}) {
  const { mediaToken } = useParams<any>();
  useMedia({
    mediaToken: pageState.mediaFileToken || mediaToken,
    onSuccess: (res: any) => {
      dispatchPageState({
        type: 'loadFileSuccess',
        payload: {
          mediaFile: res,
          mediaFileToken: pageState.mediaFileToken || mediaToken
        }
      })
    },
  });

  const [filterState, setFilterState] = useState({
    outputPath: "vid2vid/SparseUpscaleInterp_00001.mp4",
    workflowConfig: "weight_q8sz47gmfw2zx02snrbz88ns9",
    seed: "",
    sdModelToken: "",
    loraModelToken: "",
    posPrompt: "",
    negPrompt: "",
    firstPass: 1,
    upscalePass: 0.42,
    motionScale:1,
    upscaleMultiplier: 1.5,
    useEmptyLatent: false,
    useFaceDetailer: false,
    denoiseFaceDetailer: 0.45,
    useLCM: false,
    lcmCFG: 2,
    lcmSteps: 8,
    framesCap:16,
    skipFrames:0,
    nthFrames:2,
    inputFps: 24,
    interpolationMutiplier: 2,
    cnTile: 0,
    cnCanny: 0,
    cnLinearAnime: 0,
    cnLinearRealistic: 0,
    cnDepth: 0,
    cnOpenPose: 0,
    cnPipeFace: 0,
    cnSparse: 0.7,
  });

  const handleOnChange = (key: string, newValue:any,) => {
    setFilterState((curr)=>({...curr, [key]: newValue}));
  }

  const history = useHistory();
  const handleGenerate = ()=>{
    console.log("filterState:")
    console.log(filterState)

    const request = {
      "uuid_idempotency_token": uuidv4(),
      "maybe_sd_model": filterState.sdModelToken,
      "maybe_workflow_config": filterState.workflowConfig,
      "maybe_input_file": pageState.mediaFileToken || mediaToken,
      "maybe_output_path": filterState.outputPath,
      "maybe_json_modifications": {
        "$.510.inputs.Text": filterState.posPrompt,
        "$.8.inputs.text": filterState.negPrompt,
        "$.173.inputs.seed": filterState.seed,
        "$.401.inputs.Value": filterState.firstPass,
        "$.918.inputs.Value": filterState.motionScale,
        "$.137.inputs.Value": filterState.framesCap,
        "$.186.inputs.Value": filterState.skipFrames,
        "$.140.inputs.Value": filterState.nthFrames,
        "$.154.inputs.Value": filterState.inputFps,
        "$.445.inputs.number": filterState.interpolationMutiplier,
        "$.947.inputs.Value": filterState.cnTile,
        "$.800.inputs.Value": filterState.cnCanny,
        "$.797.inputs.Value": filterState.cnLinearAnime,
        "$.796.inputs.Value": filterState.cnLinearRealistic,
        "$.772.inputs.Value": filterState.cnDepth,
        "$.771.inputs.Value": filterState.cnOpenPose,
        "$.527.inputs.Value": filterState.cnPipeFace,
        "$.403.inputs.Value": filterState.cnSparse
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
  }

  if (pageState.mediaFile){
    const mediaLink = new BucketConfig().getGcsUrl(pageState.mediaFile.public_bucket_path);

    if (mediaLink)
      return(
        <>
          <Panel>
            <div className="row g-3 p-3">
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
          <Accordion className="mt-4">
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
                      value: filterState.posPrompt,
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
                      value: filterState.negPrompt,
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
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                      min: 0.1, max: 1, step: 0.01,
                      initialValue: filterState.firstPass,
                      label: " Denoise First Pass",
                      thumbTip: "Denoise First Pass",
                      onChange: (val)=>{handleOnChange("firstPass",val)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0.1, max: 1, step: 0.01,
                    initialValue: filterState.upscalePass,
                    label: "Denoise Upscale Pass",
                    thumbTip: "Denoise Upscale Pass",
                    onChange: (val)=>{handleOnChange("upscalePass", val)}
                  }}/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0.25, max: 2, step: 0.05,
                    initialValue: filterState.motionScale,
                    label: "Motion Scale",
                    thumbTip: "Motion Scale",
                    onChange: (val)=>{handleOnChange("motionScale", val)}
                  }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 1.5, max: 2, step: 0.5,
                    initialValue: filterState.upscaleMultiplier,
                    label: "Upscale Multiplier",
                    thumbTip: "Upscale Multiplier",
                    onChange: (val)=>{handleOnChange("upscaleMultiplier", val)}
                  }}/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <Checkbox 
                    label="Use Empty Latent" 
                    checked={filterState.useEmptyLatent}
                    onChange={(e:{target:{ checked: boolean, name:string, type: string }})=>{handleOnChange("useEmptyLatent", e.target.checked)}}
                  />
                </div>
                <div className="col-md-6">
                  <Checkbox 
                    label="Use Face Detailer" 
                    checked={filterState.useFaceDetailer}
                    onChange={(e:{target:{ checked: boolean, name:string, type: string }})=>{handleOnChange("useFaceDetailer", e.target.checked)}}
                  />
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">

                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0.1, max: 0.7, step: 0.01,
                    initialValue: filterState.denoiseFaceDetailer,
                    label: "Denoise Face Detailer",
                    thumbTip: "Denoise Face Detailer",
                    onChange: (val)=>{handleOnChange("denoiseFaceDetailer", val)}
                  }}/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <Checkbox 
                  label="Use LCM" 
                  checked={filterState.useLCM}
                  onChange={(e:{target:{ checked: boolean, name:string, type: string }})=>{handleOnChange("useLCM", e.target.checked)}}
                />
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 1, max: 10, step: 1,
                    initialValue: filterState.lcmCFG,
                    label: "LCM CFG",
                    thumbTip: "LCM CFG",
                    onChange: (val)=>{handleOnChange("lcmCFG", val)}
                  }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 5, max: 15, step: 1,
                    initialValue: filterState.lcmSteps,
                    label: "LCM Steps",
                    thumbTip: "LCM Steps",
                    onChange: (val)=>{handleOnChange("lcmSteps", val)}
                  }}/>
                </div>
              </div>
            </Accordion.Item>
            <Accordion.Item title="Control Nets" defaultOpen>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0, max: 1, step: 0.1,
                    initialValue: filterState.cnCanny,
                    label: "Canny",
                    thumbTip: "Canny",
                    onChange: (val)=>{handleOnChange("cnCanny", val)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0, max: 1, step: 0.1,
                    initialValue: filterState.cnLinearAnime,
                    label: "Line Art Anime",
                    thumbTip: "Line Art Anime",
                    onChange: (val)=>{handleOnChange("cnLinearAnime", val)}
                    }}/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0, max: 1, step: 0.1,
                    initialValue: filterState.cnDepth,
                    label: "Depth",
                    thumbTip: "Depth",
                    onChange: (val)=>{handleOnChange("cnDepth", val)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0, max: 1, step: 0.1,
                    initialValue: filterState.cnOpenPose,
                    label: "OpenPose",
                    thumbTip: "OpenPose",
                    onChange: (val)=>{handleOnChange("cnOpenPose", val)}
                    }}/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0, max: 1, step: 0.1,
                    initialValue: filterState.cnPipeFace,
                    label: "Media Pipe Face",
                    thumbTip: "Media Pipe Face",
                    onChange: (val)=>{handleOnChange("cnPipeFace", val)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0, max: 1, step: 0.1,
                    initialValue: filterState.cnSparse,
                    label: "Sparse Scribble",
                    thumbTip: "Sparse Scribble",
                    onChange: (val)=>{handleOnChange("cnSparse", val)}
                    }}/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0, max: 1, step: 0.1,
                    initialValue: filterState.cnLinearRealistic,
                    label: "Video CN (Linear Realistic)",
                    thumbTip: "Video CN",
                    onChange: (val)=>{handleOnChange("cnLinearRealistic", val)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0, max: 1, step: 0.1,
                    initialValue: filterState.cnTile,
                    label: "Tile CN",
                    thumbTip: "Tile CN",
                    onChange: (val)=>{handleOnChange("cnTile", val)}
                    }}/>
                </div>
              </div>
            </Accordion.Item>
            <Accordion.Item title="Video Settings">
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <Input label="Width" />
                </div>
                <div className="col-md-6">
                  <Input label="Height" />
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <Input label="Frames Cap" />
                </div>
                <div className="col-md-6">
                  <Input label="Skip Frames" />
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <Input label="Every n-th Frame" />
                </div>
                <div className="col-md-6">
                  <Input label="Input FPS" readOnly/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <Input label="Interpolation Multiplier" />
                </div>
                <div className="col-md-6">
                </div>
              </div>
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