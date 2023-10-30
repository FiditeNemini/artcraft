import { GrabEndpoint } from "../GrabEndpoint"

interface CreateVoiceRequest {
    // args
    example_token: String;
}

interface CreateVoiceResponse {
    // args
    name: string,
}

const List = GrabEndpoint<string, CreateVoiceRequest, CreateVoiceResponse>({
    method: "GET", 
    routingFunction: (userToken:  string) => `user/${ userToken }/list`,
});


export default List;