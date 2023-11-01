import MakeRequest from "../MakeRequest";

interface UpdateVoiceRequest {
  title: string,
  creator_set_visibility: string,
  ietf_language_tag: string,
}

interface UpdateVoiceResponse {
    success: boolean,
}

const UpdateVoice = MakeRequest<string, UpdateVoiceRequest, UpdateVoiceResponse>({
    method: "POST", 
    routingFunction: (voiceToken:  string) => `/${ voiceToken }/update`,
});


export default UpdateVoice;