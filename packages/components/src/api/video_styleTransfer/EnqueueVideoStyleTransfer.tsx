import { ApiConfig } from "@storyteller/components";

export interface EnqueueVideoStyleTransferRequest {
  "uuid_idempotency_token":string;
  "maybe_sd_model": string;
  "maybe_workflow_config": string;
  "maybe_input_file": string;
  "maybe_output_path": string; 
  "creator_set_visibility": string;
  "maybe_json_modifications": {
    "$.154.inputs.Value": number;
    "$.510.inputs.Text": string;
    "$.8.inputs.text": string;

    "$.800.inputs.Value": number;
    "$.772.inputs.Value": number;
    "$.797.inputs.Value": number; 
    "$.796.inputs.Value": number;
    "$.1636.inputs.Value": number;
    "$.771.inputs.Value": number;
    "$.403.inputs.Value": number;
    "$.1398.inputs.Value": number;
    "$.1531.inputs.Value": number;
    
    // "$.1449.inputs.filename_prefix": string;
    // "$.208.inputs.lora_01": string;
    // "$.208.inputs.strength_01": number;
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

