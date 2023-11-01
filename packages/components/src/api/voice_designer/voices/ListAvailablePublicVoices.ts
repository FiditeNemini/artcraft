import MakeRequest from "../../MakeRequest";
import { UserDetailsLight } from "../../_common/UserDetailsLight";

export interface ListAvailablePublicVoicesRequest {
    sort_ascending?: boolean,
    limit?: number,
    cursor?: string,
    cursor_is_reversed?: boolean,
}

export interface ListAvailablePublicVoicesResponse {
    success: boolean,
    voices: Voice[],
    cursor_next: string,
    cursor_previous: string,
}

export interface Voice {
    voice_token: string,
    title: string,
    
    ietf_language_tag: string,
    ietf_primary_language_subtag: string,

    creator: UserDetailsLight,
    creator_set_visibility: string,

    created_at: Date,
    updated_at: Date,
}

export const ListAvailablePublicVoices = MakeRequest<string, ListAvailablePublicVoicesRequest, ListAvailablePublicVoicesResponse>({
    method: "GET", 
    routingFunction: (userToken:  string) => `/v1/voice_designer/voice/list`,
});
