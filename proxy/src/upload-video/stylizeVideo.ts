import { v4 as uuidv4 } from "uuid";
import { ArtStyle, Visibility } from "common";

declare const process: {
  env: {
    BASE_API: string;
  };
};

export async function stylizeVideo({
  media_token,
  style,
  positive_prompt,
  negative_prompt,
  visibility,
  use_face_detailer = false,
  use_upscaler = false,
  use_strength = 1.0,
  sessionToken,
}: {
  media_token: string;
  style: ArtStyle;
  positive_prompt: string;
  negative_prompt: string;
  visibility: Visibility;
  use_face_detailer: boolean;
  use_upscaler: boolean;
  use_strength: number;
  sessionToken: string;
}) {
  const uuid = uuidv4();

  const data = {
    uuid_idempotency_token: uuid,
    style: style,
    input_file: media_token,
    prompt: positive_prompt,
    negative_prompt: negative_prompt,
    trim_start_millis: 0,
    trim_end_millis: 7000,
    enable_lipsync: true,
    creator_set_visibility: visibility,
    use_face_detailer: use_face_detailer,
    use_upscaler: use_upscaler,
    use_strength: use_strength,
  };

  const json_data = JSON.stringify(data);

  const response = await fetch(`${process.env.BASE_API}/v1/video/enqueue_vst`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      session: sessionToken,
    },
    body: json_data,
  });

  if (!response.ok) {
    // Handle HTTP error responses
    const errorData = await response.json();
    throw new Error(`API Error: ${response.status} ${errorData.message}`);
  }

  // Assuming the response is JSON and matches the EnqueueVideoStyleTransferSuccessResponse interface
  return await response.json();
}
