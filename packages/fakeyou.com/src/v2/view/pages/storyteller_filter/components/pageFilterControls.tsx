import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";

import { useMedia } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { states, Action, State } from "../storytellerFilterReducer";
import {
  Accordion,
  BasicVideo,
  Checkbox,
  ErrorMessage,
  Input,
  InputSeed,
  NumberSliderV2,
  Panel,
  SelectModal,
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
        payload: {
          mediaFile: res,
          mediaFileToken: pageState.mediaFileToken || mediaToken
        }
      })
    },
  });

  const [filterState, setFilterState] = useState({
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
    lcmSteps: 8
  });
  useEffect(()=>{
    if(debug) console.log(filterState)
  },[filterState, debug])

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
                      weightTypeFilter: "sdxl",
                      searcher: true,
                      type: "weights",
                    },
                    {
                      label: "Bookmarked",
                      tabKey: "bookmarkedWeights",
                      weightTypeFilter: "sdxl",
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
                      weightTypeFilter: "rvc_v2",
                      searcher: true,
                      type: "weights",
                    },
                    {
                      label: "Bookmarked",
                      tabKey: "bookmarkedLoraWeights",
                      weightTypeFilter: "rvc_v2",
                      searcher: false,
                      type: "weights",
                    },
                  ]}
                />
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <TextAreaV2
                    {...{
                      label: "Prompt",
                      placeholder: "Enter a prompt",
                      onChange: (val:string)=>handleOnChange("posPrompt", val),
                      value: filterState.posPrompt,
                      required: false,
                    }}
                  />
                </div>
                <div className="col-md-6">
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
                      min: 0.1,
                      max: 1,
                      step: 0.01,
                      initialValue: filterState.firstPass,
                      label: " Denoise First Pass",
                      thumbTip: "Denoise First Pass",
                      onChange: (val)=>{handleOnChange("firstPass",val)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0.1,
                    max: 1,
                    step: 0.01,
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
                    min: 0.25,
                    max: 2,
                    step: 0.05,
                    initialValue: filterState.motionScale,
                    label: "Motion Scale",
                    thumbTip: "Motion Scale",
                    onChange: (val)=>{handleOnChange("motionScale", val)}
                  }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 1.5,
                    max: 2,
                    step: 0.5,
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
                    min: 0.1,
                    max: 0.7,
                    step: 0.01,
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
                    min: 1,
                    max: 10,
                    step: 1,
                    initialValue: filterState.lcmCFG,
                    label: "LCM CFG",
                    thumbTip: "LCM CFG",
                    onChange: (val)=>{handleOnChange("lcmCFG", val)}
                  }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 5,
                    max: 15,
                    step: 1,
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
                <Checkbox 
                  label="Use Control Nets" 
                  checked={false}
                  onChange={(e:{target:{ checked: boolean, name:string, type: string }})=>{
                    console.log(`Use Control Nets: ${e.target.checked}`)
                  }}
                />
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0,
                    max: 1,
                    step: 0.1,
                    initialValue: 0,
                    label: "Canny",
                    thumbTip: "Canny",
                    onChange: (val)=>{console.log(`Canny: ${val}`)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0,
                    max: 1,
                    step: 0.1,
                    initialValue: 0,
                    label: "Line Art Anime",
                    thumbTip: "Line Art Anime",
                    onChange: (val)=>{console.log(`Line Art Anime: ${val}`)}
                    }}/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0,
                    max: 1,
                    step: 0.1,
                    initialValue: 0,
                    label: "Depth",
                    thumbTip: "Depth",
                    onChange: (val)=>{console.log(`Depth: ${val}`)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0,
                    max: 1,
                    step: 0.1,
                    initialValue: 0,
                    label: "OpenPose",
                    thumbTip: "OpenPose",
                    onChange: (val)=>{console.log(`OpenPose: ${val}`)}
                    }}/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0,
                    max: 1,
                    step: 0.1,
                    initialValue: 0,
                    label: "Media Pipe Face",
                    thumbTip: "Media Pipe Face",
                    onChange: (val)=>{console.log(`Media Pipe Face: ${val}`)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0,
                    max: 1,
                    step: 0.1,
                    initialValue: 0.7,
                    label: "Sparse Scribble",
                    thumbTip: "Sparse Scribble",
                    onChange: (val)=>{console.log(`Sparse Scribble: ${val}`)}
                    }}/>
                </div>
              </div>
              <div className="row g-3 p-3">
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0,
                    max: 1,
                    step: 0.1,
                    initialValue: 0.5,
                    label: "Video CN",
                    thumbTip: "Video CN",
                    onChange: (val)=>{console.log(`Video CN: ${val}`)}
                    }}/>
                </div>
                <div className="col-md-6">
                  <NumberSliderV2 {...{
                    min: 0,
                    max: 1,
                    step: 0.1,
                    initialValue: 0,
                    label: "Tile CN",
                    thumbTip: "Tile CN",
                    onChange: (val)=>{console.log(`Tile CN: ${val}`)}
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
                  <Input label="Input FPS" />
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