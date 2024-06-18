import {
  listTts,
  listV2V,
  inferTts,
  listMediaByUser,
  getMediaFileByToken,
  inferV2V,
} from "~/api";
import {
  VoiceConversionModelListResponse,
  EnqueueVoiceConversionRequest,
  EnqueueVoiceConversionResponse,
} from "./typesImported";
import {
  TtsModelListItem,
  TtsModelListResponsePayload,
  StatusLike,
  GenerateTtsAudioRequest,
  GenerateTtsAudioResponse,
} from "~/pages/PageEnigma/models/tts";

import { GenerateTtsAudioErrorType } from "~/pages/PageEnigma/enums";
import {
  GetMediaFileResponse,
  VoiceConversionModelListItem,
} from "~/pages/PageEnigma/models";

import { authentication } from "~/signals";
const { userInfo } = authentication;

export const ListAudioByUser = () => {
  if (userInfo.value) {
    return fetch(
      listMediaByUser(userInfo.value.username) + "?filter_media_type=audio",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.results) {
          return res.results;
        } else {
          Promise.reject();
        }
      })
      .catch(() => ({ success: false }));
  } else {
    return new Promise((resolve) => {
      resolve({ success: false });
    });
  }
};

export function ListTtsModels(): Promise<Array<TtsModelListItem> | undefined> {
  if (userInfo.value) {
    return fetch(listTts, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        const response: TtsModelListResponsePayload = res;
        if (!response.success) {
          return undefined;
        }
        return response?.models;
      })
      .catch(() => {
        return undefined;
      });
  } else {
    return new Promise((resolve) => {
      resolve(undefined);
    });
  }
}

export function maybeMapError(
  statuslike: StatusLike,
): GenerateTtsAudioErrorType | undefined {
  switch (statuslike.status) {
    case 400:
      return GenerateTtsAudioErrorType.BadRequest;
    case 404:
      return GenerateTtsAudioErrorType.NotFound;
    case 429:
      return GenerateTtsAudioErrorType.TooManyRequests;
    case 500:
      return GenerateTtsAudioErrorType.ServerError;
  }
}

export function GenerateTtsAudio(
  request: GenerateTtsAudioRequest,
): Promise<GenerateTtsAudioResponse> {
  return fetch(inferTts, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  })
    .then((res) => res.json())
    .then((res) => {
      if (!("inference_job_token" in res)) {
        return { error: GenerateTtsAudioErrorType.UnknownError };
      }
      const ret: GenerateTtsAudioResponse = {
        success: true,
        inference_job_token: res.inference_job_token,
        inference_job_token_type: res.inference_job_token_type,
      };
      return ret;
    })
    .catch((e) => {
      const maybeError = maybeMapError(e);
      if (maybeError !== undefined) {
        return { error: maybeError };
      }
      return { error: GenerateTtsAudioErrorType.UnknownError };
    });
}

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

export function ListVoiceConversionModels(): Promise<
  Array<VoiceConversionModelListItem> | undefined
> {
  return fetch(listV2V, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => {
      const response: VoiceConversionModelListResponse = res;
      if (!response.success) {
        return;
      }
      return response?.models;
    })
    .catch(() => {
      return undefined;
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
