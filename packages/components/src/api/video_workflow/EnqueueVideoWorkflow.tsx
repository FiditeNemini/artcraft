import { ApiConfig } from "@storyteller/components";

export interface EnqueueVideoWorkflowRequest {
  "uuid_idempotency_token": string,
  
  "maybe_sd_model": string,
  "maybe_workflow_config": string,
  "maybe_input_file": string,
  "maybe_output_path": string,
  "maybe_json_modifications": {
    "$.510.inputs.Text": string,
    "$.8.inputs.text": string,
    "$.173.inputs.seed": string,
    "$.401.inputs.Value": number,
    "$.918.inputs.Value": number,
    "$.137.inputs.Value": number,
    "$.186.inputs.Value": number,
    "$.140.inputs.Value":number,
    "$.154.inputs.Value": number,
    "$.445.inputs.number": number,
    "$.947.inputs.Value": number,
    "$.800.inputs.Value": number,
    "$.797.inputs.Value": number,
    "$.796.inputs.Value": number,
    "$.772.inputs.Value": number,
    "$.771.inputs.Value": number,
    "$.527.inputs.Value": number,
    "$.403.inputs.Value": number,
  }
}

export interface EnqueueVideoWorkflowResponse {
  success: boolean,
  inference_job_token?: string,
}

export async function EnqueueVideoWorkflow(request: EnqueueVideoWorkflowRequest) : Promise<EnqueueVideoWorkflowResponse> 
{
  const endpoint = new ApiConfig().enqueueVideoWorkflow();
  
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

