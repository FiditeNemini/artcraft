import { v4 as uuidv4 } from "uuid";
import { hiddenValues } from "./defaultValues";

export type VSTType = {
  // File Settings
  fileToken: string;
  outputPath: string;
  // Video Settings
  width: number;
  height: number;
  maxFrames: number;
  framesCap: number;
  skipFrames: number;
  
  // Presets
  workflowConfig: string;
  sdModelToken: string;
  // loraModelToken: string;
  // loraModelStrength: number;

  //basics
  inputFps: number;
  posPrompt: string;
  negPrompt: string;
  visibility: string;

  //advance
  cnCanny: number;
  cnDepth: number;
  cnLinearAnime: number;
  cnLinearRealistic: number;
  cnLipsStrength: number;
  cnOpenPose: number;
  cnPipeFace: number;
  cnSparseScribble: number;
  cnSoftEdge: number;
  cnRegularSteps: number
}

export function isInputValid(keyValues: {[key:string]:number|string|boolean|undefined}){
  return (
    keyValues.sdModelToken 
    && keyValues.sdModelToken !== ""
    && keyValues.posPrompt
    && keyValues.posPrompt !== ""
  );
}

export function mapRequest(vstValues: VSTType){
  //TODO: improve the typing of this
  return{
    "uuid_idempotency_token": uuidv4(),
    "maybe_sd_model": vstValues.sdModelToken,
    "maybe_workflow_config":vstValues.workflowConfig,
    "maybe_input_file": vstValues.fileToken,
    "maybe_output_path":"", 
    "creator_set_visibility": vstValues.visibility,
    "maybe_json_modifications": {
      "$.154.inputs.Value": vstValues.inputFps,
      "$.510.inputs.Text":
        hiddenValues.posPrompt + vstValues.posPrompt,
      "$.8.inputs.text": 
        hiddenValues.negPrompt+ vstValues.negPrompt,

      "$.800.inputs.Value": vstValues.cnCanny,
      "$.772.inputs.Value": vstValues.cnDepth, 
      "$.797.inputs.Value": vstValues.cnLinearAnime, 
      "$.796.inputs.Value": vstValues.cnLinearRealistic,
      "$.1636.inputs.Value": vstValues.cnLipsStrength,
      "$.771.inputs.Value": vstValues.cnOpenPose, 
      "$.403.inputs.Value": vstValues.cnSparseScribble, 
      "$.1398.inputs.Value": vstValues.cnSoftEdge,
      "$.1531.inputs.Value": vstValues.cnRegularSteps,
      
      // "$.208.inputs.lora_01": vstValues.loraModelToken,
      // "$.208.inputs.strength_01": vstValues.loraModelStrength
    },

  }
}
