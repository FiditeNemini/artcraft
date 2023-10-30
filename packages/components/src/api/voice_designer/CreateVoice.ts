import { GrabEndpoint } from "../GrabEndpoint"

interface CreateVoiceRequest {
    // args
    example_token: String;
}

interface CreateVoiceResponse {
    // args
    name: string,
}

const CreateVoice = GrabEndpoint<string, CreateVoiceRequest, CreateVoiceResponse>({
    method: "POST", 
    routingFunction: () => "voice_designer/create",
});


export default CreateVoice;