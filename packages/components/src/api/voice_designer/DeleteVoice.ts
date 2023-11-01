import MakeRequest from "../MakeRequest";

interface DreateVoiceRequest {
  set_delete: boolean,
  as_mod: boolean
},

interface DreateVoiceResponse {
  success: boolean
}

const DeleteVoice = MakeRequest<string, DreateVoiceRequest, DreateVoiceResponse>({
  method: "POST", 
  routingFunction: (voiceToken:  string) => `/${ voiceToken }/delete`,
});


export default DeleteVoice;