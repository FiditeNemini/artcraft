import { v4 as uuidv4 } from "uuid";
import {
  uploadNewScene as uploadNewSceneEndpoint,
  updateExistingScene as updateExistingSceneEndpoint
} from "~/api";

export const uploadNewScene = async (
  file:File,
  sceneTitle: string,
  sessionToken: string,
) => {
  const endpoint = uploadNewSceneEndpoint;
  const formData = new FormData();
  formData.append("uuid_idempotency_token", uuidv4());
  formData.append("file", file);
  formData.append("maybe_title", sceneTitle);
  formData.append("maybe_visibility", "public");
  formData.append("engine_category", "scene");
  
  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      session: sessionToken,
    },
    body: formData,
  })
  .then(res => res.json())
  .then(res => {
    if (res && res.success) {
      return res;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}

export const updateExistingScene = async (
  file:File,
  sceneToken: string,
  sessionToken: string,
) => {
  const endpoint = updateExistingSceneEndpoint(sceneToken);

  const formData = new FormData();
  formData.append("uuid_idempotency_token", uuidv4());
  formData.append("file", file);
 
  return await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        session: sessionToken,
      },
      body: formData,
  })
  .then(res => res.json())
  .then(res => {
    if (res && res.success) {
      return res;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}

// function uploadEngineAsset(
//   file: File,
//   media_file_token: string | null,
// ): Promise<any> {
//   const url = `${this.baseUrl}/v1/media_files/write/engine_asset`;
//   const uuid = uuidv4();
//   const form_data = new FormData();
//   form_data.append("uuid_idempotency_token", uuid);

//   // update existing scene otherwise create new glb scene and use it's media_file_id
//   if (media_file_token != null) {
//     form_data.append("media_file_token", media_file_token);
//   }

//   form_data.append("file", file);
//   form_data.append("source", "file");
//   form_data.append("media_file_subtype", "scene_import");
//   form_data.append("media_file_class", "scene");

//   const response = await fetch(url, {
//     method: "POST",
//     // credentials: "include",
//     headers: {
//       Accept: "application/json",
//       session: this.sessionToken,
//     },
//     body: form_data,
//   });

//   if (!response.ok) {
//     throw new Error("Failed to Send Data");
//   } else {
//     const json_data = await response.json();
//     return json_data; // or handle the response as appropriate
//   }
// }