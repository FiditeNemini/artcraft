import { v4 as uuidv4 } from "uuid";

export type WorkflowValuesType = {
  // File Settings
  fileToken: string;
  outputPath: string;
  // Video Settings
  width: number;
  height: number;
  maxFrames: number;
  framesCap: number;
  skipFrames: number;
  everyNthFrame: number;
  inputFps: number;
  interpolationMultiplier: number;
  // Basic Inputs
  workflowConfig: string;
  seed: string;
  sdModelToken: string;
  sdModelTitle: string;
  loraModelToken: string;
  loraModelTitle: string;
  posPrompt: string;
  negPrompt: string;
  // Advance Options Values
  firstPass: number;
  upscalePass: number;
  motionScale: number;
  upscaleMultiplier: number;
  useEmptyLatent: boolean;
  useFaceDetailer: boolean;
  denoiseFaceDetailer: number;
  useLCM: boolean;
  lcmCFG: number;
  lcmSteps: number;
  // Control Net Values
  cnCanny: number;
  cnDepth: number;
  cnLinearAnime: number;
  cnLinearRealistic: number;
  cnOpenPose: number;
  cnPipeFace: number;
  cnSparse: number;
  cnTile: number;
}
export function isInputValid(keyValues: {[key:string]:number|string|boolean|undefined}){
  return (
    keyValues.sdModelToken 
    && keyValues.sdModelToken !== ""
    && keyValues.posPrompt
    && keyValues.posPrompt !== ""
  );
}

export function mapRequest(workflowValues: WorkflowValuesType){
  //TODO: improve the typing of this
  return {
    "uuid_idempotency_token": uuidv4(),
    "maybe_sd_model": workflowValues.sdModelToken,
    "maybe_workflow_config": workflowValues.workflowConfig,
    "maybe_input_file": workflowValues.fileToken,
    "maybe_output_path": workflowValues.outputPath,
    "maybe_json_modifications": {
      "$.510.inputs.Text": workflowValues.posPrompt,
      "$.8.inputs.text": workflowValues.negPrompt,
      "$.173.inputs.seed": workflowValues.seed,
      "$.401.inputs.Value": workflowValues.firstPass,
      "$.918.inputs.Value": workflowValues.motionScale,
      "$.137.inputs.Value": workflowValues.framesCap,
      "$.186.inputs.Value": workflowValues.skipFrames,
      "$.140.inputs.Value": workflowValues.everyNthFrame,
      "$.154.inputs.Value": workflowValues.inputFps,
      "$.445.inputs.number": workflowValues.interpolationMultiplier,
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
}