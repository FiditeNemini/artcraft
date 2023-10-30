import { GrabEndpoint } from "../GrabEndpoint"

interface CreateVoiceRequest {
    // args
    example_token: String;
}

interface CreateVoiceResponse {
    // args
    name: string,
}

const UpdateVoice = GrabEndpoint<string, CreateVoiceRequest, CreateVoiceResponse>({
    method: "PATCH", 
    routingFunction: (voiceToken:  string) => `${ voiceToken }/update`,
});


export default UpdateVoice;