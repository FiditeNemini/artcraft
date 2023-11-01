import MakeRequest from "../../MakeRequest";

export interface ListSamplesForDatasetRequest {}

export interface ListSamplesForDatasetResponse {
    sample_token: string,

    media_file_token: string,
    media_type: string,

    public_bucket_directory_hash: string,
    maybe_public_bucket_prefix?: string,
    maybe_public_bucket_extension?: string,
    
    maybe_creator_user_token?: string,

    created_at: Date,
    updated_at: Date,
}

export const ListSamplesForDataset = MakeRequest<string, ListSamplesForDatasetRequest, ListSamplesForDatasetResponse>({
    method: "GET", 
    routingFunction: (datasetToken:  string) => `/v1/voice_designer/sample/dataset/${ datasetToken }/list`,
});
