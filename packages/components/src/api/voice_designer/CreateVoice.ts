import { GrabEndpoint } from "../GrabEndpoint"

interface CreateVoiceRequest {
  uuid_idempotency_token: string,
  voice_dataset_token: string,
}

interface CreateVoiceResponse {
  success: boolean,
  inference_job_token: string,
}

const CreateVoice = GrabEndpoint<string, CreateVoiceRequest, CreateVoiceResponse>({
    method: "POST", 
    routingFunction: () => "voice_designer/create",
});


export default CreateVoice;