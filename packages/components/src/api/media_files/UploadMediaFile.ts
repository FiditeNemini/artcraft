import MakeMultipartRequest from "../MakeMultipartRequest";

export interface UploadMediaFileRequest {
  uuid_idempotency_token?: string;
  file_name: string;
  file_bytes: any;
  media_source: string;
}

export interface UploadMediaFileResponse {
  success: boolean;
  media_file_token: string;
}

export const UploadMedia = (thing = "", request: UploadMediaFileRequest) => {
  return MakeMultipartRequest("/v1/media_files/upload", request);
};
