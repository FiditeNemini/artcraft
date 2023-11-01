import MakeRequest from "../../MakeRequest";

export interface DreateVoiceRequest {
  set_delete: boolean;
  as_mod: boolean;
}

export interface DreateVoiceResponse {
  success: boolean
}

export const DeleteVoice = MakeRequest<string, DreateVoiceRequest, DreateVoiceResponse>({
  method: "DELETE", 
  routingFunction: (voiceToken:  string) => `/v1/voice_designer/dataset/${ voiceToken }/delete`,
});
