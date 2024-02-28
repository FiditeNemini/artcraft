import { ApiConfig } from "@storyteller/components";

export interface EnqueueVideoStyleTransferRequest {
  "uuid_idempotency_token":string;
  "maybe_sd_model": string;           // SD Token
  "maybe_workflow_config": string;    // Workflow Toekn
  "maybe_input_file": string;         // Input File Token
  "maybe_output_path": string;        // Result Path
  "creator_set_visibility": string;   // Result Privacy
  "maybe_json_modifications": {
    "$.154.inputs.Value": number;  // input FPS
    "$.510.inputs.Text": string;   // positive Prompt
    "$.8.inputs.text": string;     // negative Prompt

    
    "$.403.inputs.Value": number;  // CN - SparseScribble
    "$.771.inputs.Value": number;  // CN - Open Pose
    "$.772.inputs.Value": number;  // CN - Depth
    "$.796.inputs.Value": number;  // CN - Line Art Realistic
    "$.797.inputs.Value": number;  // CN - Line Art Anime
    "$.1398.inputs.Value": number; // CN - Soft Edge
    "$.1531.inputs.Value": number; // CN - Regular Steps
    
    //HARD CODE VALUES FOR NOW
    "$.401.inputs.Value": number, //Denoise First Pass
    "$.140.inputs.Value": number,   // Every nth frame
    "$.536.inputs.boolean_number": number, // use LCM

    "$.1075.inputs.Value": number,
    "$.1076.inputs.Value": number,
    "$.1079.inputs.Value": number,
    "$.1080.inputs.Value": number,

    //"$.800.inputs.Value": number;   // CN - Canny
    //"$.1636.inputs.Value": number;  // CN - Libs Strength
    
    // "$.1449.inputs.filename_prefix": string;   // Output Path Prefix
    // "$.208.inputs.lora_01": string;            // LoRA Model Token
    // "$.208.inputs.strength_01": number;        // LoRA Model Strength
  }
}

export interface EnqueueVideoStyleTransferResponse {
  success: boolean,
  inference_job_token?: string,
}

export async function EnqueueVideoStyleTransfer(request: EnqueueVideoStyleTransferRequest) : Promise<EnqueueVideoStyleTransferResponse> 
{
  // const endpoint = "/v1/workflow/comfy/create";

  const endpoint = new ApiConfig().enqueueVideoStyleTransfer();
  
  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  })
  .then(res => res.json())
  .then(res => {
    if (!res) {
      return { success : false };
    }

    if (res && 'success' in res) {
      return res;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}

