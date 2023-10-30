import { GrabEndpoint } from "../GrabEndpoint"

interface CreateVoiceRequest {
    // args
    example_token: String;
}

interface CreateVoiceResponse {
    // args
    name: string,
}

const DeleteVoice = GrabEndpoint<string, CreateVoiceRequest, CreateVoiceResponse>({
    method: "POST", 
    routingFunction: (voiceToken:  string) => `${ voiceToken }/delete`,
});


export default DeleteVoice;