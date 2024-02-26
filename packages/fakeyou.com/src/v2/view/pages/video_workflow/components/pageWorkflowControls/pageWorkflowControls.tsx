import React, {useState, useRef} from "react";
import { useParams, useHistory } from "react-router-dom";
import { useMedia } from "hooks";

import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { EnqueueVideoWorkflow } from "@storyteller/components/src/api/video_workflow";
import { states, Action, State } from "../../videoWorkflowReducer";
import {
  Accordion,
  Button,
  ErrorMessage,
  InputSeed,
  Panel,
  SelectModal,
  Spinner,
  TextArea
} from "components/common";

import SelectModalWeightsTabs from "components/common/SelectModalWeightsTabs";

import SectionControlNets, {ControlNetsInitialValues as CnIvs} from "./sectionControlNets";
import SectionVideoSettings, {VideoSettingsInitialValues as VideoIvs} from "./sectionVideoSettings";
import SectionAdvanceOptions, {AdvanceOptionsInitialValues as AdvIvs} from "./sectionAdvanceOptions";
import {
  isInputValid,
  mapRequest,
  WorkflowValuesType
} from "./helpers";

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

  const [workflowValues, setWorkflowValues] = useState<WorkflowValuesType>({
    fileToken: pageState.mediaFileToken || mediaToken,
    outputPath: "",
    workflowConfig: "weight_q8sz47gmfw2zx02snrbz88ns9",
    seed: "",
    sdModelToken: "",
    sdModelTitle:"",
    loraModelToken: "",
    loraModelTitle: "",
    posPrompt: "",
    negPrompt: "",
    ...VideoIvs,
    ...AdvIvs,
    ...CnIvs
  });

  const handleOnChange = (val:{[key: string]: number|string|boolean|undefined}) => {
    setWorkflowValues((curr)=>({...curr, ...val}));
  }
  const handleReset = ()=>{
    setWorkflowValues((curr)=>({
      fileToken: pageState.mediaFileToken || mediaToken,
      outputPath: "vid2vid/SparseUpscaleInterp_00001.mp4",
      workflowConfig: "weight_q8sz47gmfw2zx02snrbz88ns9",
      seed: curr.seed,
      sdModelToken: "",
      sdModelTitle: "",
      loraModelToken: "",
      loraModelTitle: "",
      posPrompt: "",
      negPrompt: "",
      ...VideoIvs,
      width: curr.width,
      height: curr.height,
      maxFrames: curr.maxFrames,
      ...AdvIvs,
      ...CnIvs
    }));
  }
  const history = useHistory();
  const handleGenerate = ()=>{
    if(debug) console.log(workflowValues)

    if (isInputValid(workflowValues)){
      const request = mapRequest(workflowValues);
      console.log(request);
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
              <div className="col-6">
                <div className="fy-basic-video">
                  <video controls ref={videoRef} 
                    style={{
                      maxHeight: "500px",
                      objectFit: "contain"
                    }}>
                    <source src={mediaLink} type="video/mp4"/>
                  </video>
                </div>
              </div>
              <div className="col-6">
                <SectionVideoSettings
                  workflowValues={workflowValues}
                  onChange={handleOnChange}
                  videoElement={videoRef?.current}
                />
                <div className="d-flex my-3 justify-content-end">
                    <Button
                      className="me-3"
                      label={t("button.previewWorkflow")}
                      tooltip="feature not available yet"
                      variant="primary"
                      disabled
                    />
                    <Button
                      className="me-3"
                      label={t("button.resetToDefault")}
                      tooltip="Reset all variables to default values"
                      variant="primary"
                      onClick={handleReset}
                    />
                    <Button
                      className="me-3"
                      label={t("button.enqueueWorkflow")}
                      onClick={handleGenerate}
                      variant="primary"
                    />
                </div>
                
              </div>
            </div>
          </Panel>
          <Accordion className="mt-4">
            <Accordion.Item title={"Basics"} defaultOpen>
              <div className="row g-3 p-3">
                <SelectModalWeightsTabs 
                  modalTitle="Select a Stable Diffusion Weight"
                  inputLabel="Select a Stable Diffusion Weight"
                  weightType="sd_1.5"
                  onSelect={({title,token})=>{
                    handleOnChange({
                      "sdModelTitle": title,
                      "sdModelToken": token,
                    });
                  }}
                  value={{
                    token:workflowValues.sdModelToken,
                    title:workflowValues.sdModelTitle,
                  }}
                />
              </div>
              <div className="row g-3 p-3">
                <SelectModal
                  modalTitle="Select a LoRA Weight"
                  label="Additional LoRA Weight"
                  onSelect={({title,token})=>{
                    console.log(`calling from select modal result select ${token}`);
                    handleOnChange({
                      "loraModelTitle": title,
                      "loraModelToken": token
                    });
                  }}
                  tabs={[
                    {
                      label: "All LoRA Weights",
                      tabKey: "allLoraWeights",
                      typeFilter: "loRA",
                      searcher: true,
                      type: "weights",
                    },
                    {
                      label: "Bookmarked",
                      tabKey: "bookmarkedLoraWeights",
                      typeFilter: "loRA",
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
                      onChange: (e:React.ChangeEvent<HTMLTextAreaElement>)=>handleOnChange({"posPrompt": e.target.value}),
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
                      onChange: (e:React.ChangeEvent<HTMLTextAreaElement>)=>handleOnChange({"negPrompt": e.target.value}),
                      value: workflowValues.negPrompt,
                      required: false,
                    }}
                  />
                </div>
              </div>
              <div className="row g-3 p-3">
                <InputSeed label="Seed" onChange={
                  (val:string)=>handleOnChange({seed: val})
                }/>
              </div>
              
            </Accordion.Item>
            <Accordion.Item title="Advance" defaultOpen>
              <SectionAdvanceOptions
                  workflowValues={workflowValues}
                  onChange={handleOnChange}
                />
            </Accordion.Item>
            <Accordion.Item title="Control Nets" defaultOpen>
              <SectionControlNets
                workflowValues={workflowValues}
                onChange={handleOnChange}
              />
            </Accordion.Item>
          </Accordion>
          <div className="row g-3 py-3">
            <div className="col-12 d-flex justify-content-end">
              <Button
                label={t("button.enqueueWorkflow")}
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