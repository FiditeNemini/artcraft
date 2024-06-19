import { inferV2V } from "~/api";
import {
  EnqueueVoiceConversionRequest,
  EnqueueVoiceConversionResponse,
} from "./typesImported";

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
