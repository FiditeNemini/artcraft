import MakeRequest from "../../MakeRequest";
import { UserDetailsLight } from "../../_common/UserDetailsLight";

export interface ListDatasetsBySessionRequest {}

export interface ListDatasetsBySessionResponse {
    voice_token: string,
    title: string,
    
    ietf_language_tag: string,
    ietf_primary_language_subtag: string,

    creator: UserDetailsLight,
    creator_set_visibility: string,

    created_at: Date,
    updated_at: Date,
}

export const ListDatasetsBySession = MakeRequest<string, ListDatasetsBySessionRequest, ListDatasetsBySessionResponse, {}>({
    method: "GET", 
    routingFunction: () => `/v1/voice_designer/dataset/session/list`,
});
