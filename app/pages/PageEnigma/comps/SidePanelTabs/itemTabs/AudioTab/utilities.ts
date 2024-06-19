import { getMediaFileByToken, inferV2V } from "~/api";
import {
  EnqueueVoiceConversionRequest,
  EnqueueVoiceConversionResponse,
} from "./typesImported";

import { GetMediaFileResponse } from "~/pages/PageEnigma/models";

export function GetMediaFileByToken(
  fileToken: string,
): Promise<GetMediaFileResponse> {
  return fetch(getMediaFileByToken(fileToken), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => {
      const response: GetMediaFileResponse = res;

      if (response && response.success && response.media_file) {
        // NB: Timestamps aren't converted to Date objects on their own!
        response.media_file.created_at = new Date(
          response.media_file.created_at,
        );
        response.media_file.updated_at = new Date(
          response.media_file.updated_at,
        );
        return response;
      } else {
        return { success: false };
      }
    })
    .catch(() => {
      return { success: false };
    });
}

export function GenerateVoiceConversion(
  request: EnqueueVoiceConversionRequest,
): Promise<EnqueueVoiceConversionResponse> {
  return fetch(inferV2V, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res) {
        return { success: false };
      }

      if (res && "success" in res) {
        return res;
      } else {
        return { success: false };
      }
    })
    .catch(() => {
      return { success: false };
    });
}
