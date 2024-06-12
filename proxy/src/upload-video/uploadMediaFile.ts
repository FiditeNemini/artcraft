import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

class APIManagerResponseError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "APIManagerResponseError";
  }
}

declare const process: {
  env: {
    BASE_API: string;
  };
};

export async function uploadMediaFile({
  blob,
  fileName,
  title,
  styleName,
  maybe_scene_source_media_file_token,
  sessionToken,
}: {
  blob: Blob;
  fileName: string;
  title: string;
  styleName?: string;
  maybe_scene_source_media_file_token: string | undefined;
  sessionToken: string;
}) {
  dotenv.config();
  console.log("base", process.env.BASE_API);
  const url = `${process.env.BASE_API}/v1/media_files/upload/new_video`;
  const uuid = uuidv4();

  const formData = new FormData();
  formData.append("uuid_idempotency_token", uuid);

  formData.append("file", blob, fileName);
  // formData.append("source", "file");
  // formData.append("type", "video");
  if (styleName) formData.append("maybe_style_name", styleName);
  formData.append("maybe_title", title);

  // This signals to the backend to hide the video from view
  formData.append("is_intermediate_system_file", "true");
  if (maybe_scene_source_media_file_token !== undefined) {
    formData.append(
      "maybe_scene_source_media_file_token",
      maybe_scene_source_media_file_token,
    );
  }
  const response = await fetch(url, {
    method: "POST",
    // credentials: "include",
    headers: {
      Accept: "application/json",
      session: sessionToken,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new APIManagerResponseError("Upload Media Failed to send file");
  } else {
    const json_data = await response.json();
    console.log(`uploadMedia: ${JSON.stringify(json_data)}`);
    return json_data;
  }
}
