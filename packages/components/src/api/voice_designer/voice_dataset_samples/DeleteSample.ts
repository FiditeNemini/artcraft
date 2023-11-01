import MakeRequest from "../../MakeRequest";

export interface DreateVoiceRequest {
  set_delete: boolean;
  as_mod: boolean;
}

export interface DreateVoiceResponse {
  success: boolean
}

export const DeleteDataset = MakeRequest<string, DreateVoiceRequest, DreateVoiceResponse>({
  method: "DELETE", 
  routingFunction: (sampleToken:  string) => `/v1/voice_designer/sample/${ sampleToken }/delete`,
});
