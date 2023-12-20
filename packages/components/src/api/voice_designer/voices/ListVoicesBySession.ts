import MakeRequest from "../../MakeRequest";
import { UserDetailsLight } from "../../_common/UserDetailsLight";

export interface ListVoicesBySessionRequest {}

export interface ListVoicesBySessionResponse {
    voice_token: string,
    title: string,
    
    ietf_language_tag: string,
    ietf_primary_language_subtag: string,

    creator: UserDetailsLight,
    creator_set_visibility: string,

    created_at: Date,
    updated_at: Date,
}

export const ListVoicesBySession = MakeRequest<string, ListVoicesBySessionRequest, ListVoicesBySessionResponse, {}>({
    method: "GET", 
    routingFunction: () => `/v1/voice_designer/voice/session/list`,
});
