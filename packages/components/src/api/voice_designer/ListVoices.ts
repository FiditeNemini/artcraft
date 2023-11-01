import MakeRequest from "../MakeRequest";

interface ListVoiceRequest {}

interface ListVoiceResponse {
    voice_token: string,
    title: string,
    creator_set_visibility: string,
    ietf_language_tag: string,
    ietf_primary_language_subtag: string,
    creator_user_token: string,
    creator_username: string,
    created_at: Date,
    updated_at: Date,
}

const List = MakeRequest<string, ListVoiceRequest, ListVoiceResponse>({
    method: "GET", 
    routingFunction: (userToken:  string) => `/user/${ userToken }/list`,
});


export default List;