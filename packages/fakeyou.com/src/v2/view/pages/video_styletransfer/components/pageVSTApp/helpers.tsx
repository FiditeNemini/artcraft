import { v4 as uuidv4 } from "uuid";
import { hiddenValues } from "./defaultValues";

export type VSTType = {
  // File Settings
  fileToken: string;
  outputPath: string;
  // Video Settings
  width: number;
  height: number;
  maxDuration: number;
  trimStart: number;
  trimEnd: number;
  
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
  cnLineArtAnime: number;
  cnLineArtRealistic: number;
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
    "maybe_trim_start_seconds": vstValues.trimStart,
    "maybe_trim_end_seconds": vstValues.trimEnd,
    "maybe_output_path": vstValues.outputPath, 
    "creator_set_visibility": vstValues.visibility,
    "maybe_json_modifications": {
      "$.154.inputs.Value": vstValues.inputFps,
      "$.510.inputs.Text":
        hiddenValues.posPrompt + vstValues.posPrompt,
      "$.8.inputs.text": 
        hiddenValues.negPrompt+ vstValues.negPrompt,

      "$.401.inputs.Value": 0.7, //Denoise First Pass
      "$.140.inputs.Value": 1,     // Every nth frame
      "$.536.inputs.boolean_number": 1,    // use LCM

      "$.403.inputs.Value": vstValues.cnSparseScribble, 
      "$.771.inputs.Value": vstValues.cnOpenPose, 
      "$.772.inputs.Value": vstValues.cnDepth, 
      "$.796.inputs.Value": vstValues.cnLineArtRealistic,
      "$.797.inputs.Value": vstValues.cnLineArtAnime, 
      "$.1398.inputs.Value": vstValues.cnSoftEdge,
      "$.1531.inputs.Value": vstValues.cnRegularSteps,

      //"$.800.inputs.Value": 0, // vstValues.cnCanny,
      //"$.1636.inputs.Value": 0, //vstValues.cnLipsStrength,
      
      // "$.208.inputs.lora_01": vstValues.loraModelToken,
      // "$.208.inputs.strength_01": vstValues.loraModelStrength
      // "$.1449.inputs.filename_prefix": "vid2vid/SparseUpscaleInterp",
    },

  }
}