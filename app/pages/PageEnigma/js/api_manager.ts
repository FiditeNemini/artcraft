import { v4 as uuidv4 } from "uuid";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TimelineDataState } from "./timeline";

/**
 * Storyteller Studio API Manager
 * The source of truth of all these media items is the database in the cloud
 */

/**
 * This is designed to surface user customer facing messages as errors.
 */
type Data = { [key: string]: any };
class APIManagerResponseSuccess {
  public user_message: String;
  public data: Data | null;
  constructor(user_message: String = "", data: Data | null = null) {
    this.data = data;
    this.user_message = user_message;
  }
}

/**
 * This is designed to surface user customer facing messages as errors.
 * Errors shouldn't be 404 or something confusing should be
 */
class APIManagerResponseError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "APIManagerResponseError";
  }
}

class APIManager {
  baseUrl: String;

  constructor() {
    this.baseUrl = "https://api.fakeyou.com";
    //this.baseUrl = "http://localhost:12345"
  }

  /**
   * @param scene The 3JS Scene we want to save.
   * @param scene_name The Scene name we want to display
   * @param scene_media_file_token If null we will we will create a new save or copy the scene, if provided we will overwrite the scene.
   * @returns APIManagerResponseMessage
   */
  public async saveSceneState(
    scene: THREE.Scene,
    scene_name: string,
    scene_media_file_token: string | null = null,
    timeline_state: TimelineDataState | null,
  ): Promise<APIManagerResponseSuccess> {
    const file = await this.gltfExport(scene);

    // will overwrite the scene on db if token exists
    const upload_glb_response = await this.uploadGLB(
      file,
      scene_media_file_token,
    );
    const glb_media_file_token = upload_glb_response["media_file_token"];

    // now write the scene
    const save_scene_timeline_response = await this.saveSceneAndTimeLineState(
      glb_media_file_token,
      scene_name,
      timeline_state,
    );
    const result_scene_media_file_token =
      save_scene_timeline_response["media_file_token"];

    const data = { media_file_token: result_scene_media_file_token };
    return new APIManagerResponseSuccess("Scene Saved", data);
  }

  public async loadSceneState(
    scene_media_file_token: string | null,
  ): Promise<APIManagerResponseSuccess> {
    const api_base_url = "https://api.fakeyou.com";
    const url = `${api_base_url}/v1/media_files/file/${scene_media_file_token}`;
    const response = await fetch(url);
    const json = await JSON.parse(await response.text());
    const bucket_path = json["media_file"]["public_bucket_path"];
    const media_base_url = "https://storage.googleapis.com/vocodes-public";
    const media_url = `${media_base_url}${bucket_path}`; // gets you a bucket path

    const file_response = await fetch(media_url);

    if (!file_response.ok) {
      throw new APIManagerResponseError("Failed to download file");
    }
    // Convert the response from a blob to json text
    let blob = await file_response.blob();
    const json_result: string = await new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onloadend = () => resolve(JSON.parse(reader.result as string));
      reader.onerror = reject;
      reader.readAsText(blob);
    });

    console.log(`loadSceneState : ${json_result}`);

    const scene_glb_media_file_id: string = json_result["glb_media_file_id"];
    
    const media_bucket_path = await this.getMediaFile(scene_glb_media_file_id);
    let glbLoader = new GLTFLoader();
    // promisify this
    const loadGlb = (bucket_path: string): Promise<THREE.Scene> => {
      return new Promise((resolve, reject) => {
        glbLoader.load(bucket_path, (glb) => {
          if (glb) {
            const scene: THREE.Scene = glb.scene;
            const data = { "media_file_token": scene_glb_media_file_id , scene: scene };
            resolve(new APIManagerResponseSuccess("Success Loaded", data));
          } else {
            reject(new APIManagerResponseError("Failed to Load GLB Scene"));
          }
        });
      });
    };

    loadGlb(media_bucket_path);
  }

  /**
   * This recieves the bucket path of a media file
   * @param media_file_token
   * @returns
   */
  private async getMediaFile(media_file_token: string): Promise<string> {
    let api_base_url = "https://api.fakeyou.com";
    let url = `${api_base_url}/v1/media_files/file/${media_file_token}`;
    let response = await fetch(url);
    let json = await JSON.parse(await response.text());
    let bucketPath = json["media_file"]["public_bucket_path"];
    let media_base_url = "https://storage.googleapis.com/vocodes-public";
    let media_url = `${media_base_url}${bucketPath}`; // gets you a bucket path
    return media_url;
  }

  /** 
    This will save the scene to keep ids positions.
    It will also give the file a name which will be a uuidv4()
    @param scene The 3JS Scene we want to make a file to be uploaded as multipart form.
  */
  private async gltfExport(scene: THREE.Scene): Promise<File> {
    const gltfExporter = new GLTFExporter();
    const uuid = uuidv4();
    const result = await gltfExporter.parseAsync(scene);
    const file = new File([JSON.stringify(result)], `${uuid}.glb`, {
      type: "application/json",
    });
    return file;
  }

  private async uploadGLB(
    file: File,
    scene_media_file_token: string | null,
  ): Promise<string> {
    const url = `${this.baseUrl}/v1/media_files/write/engine_asset`;
    let uuid = uuidv4();
    const form_data = new FormData();
    form_data.append("uuid_idempotency_token", uuid);

    // update existing scene otherwise create new scene and use it's media_file_id
    if (scene_media_file_token != null) {
      form_data.append("media_file_token", scene_media_file_token);
    }

    form_data.append("file", file);
    form_data.append("source", "file");
    form_data.append("media_file_subtype", "scene_import");
    form_data.append("media_file_class", "scene");

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: form_data,
    });

    if (!response.ok) {
      throw new Error("Failed to Send Data");
    } else {
      const json_data = await response.json();
      console.log(`uploadGLB: ${JSON.stringify(json_data)}`);
      return json_data; // or handle the response as appropriate
    }
  }

  private async saveSceneAndTimeLineState(
    scene_media_file_token: string | null,
    scene_file_name: string,
    timeline_state: TimelineDataState | null, // only for now.
  ): Promise<string> {
    const url = `${this.baseUrl}/v1/media_files/write/scene_file`;
    let uuid = uuidv4();

    // turn json into a blob
    const scene_schema = {
      glb_media_file_id: scene_media_file_token,
      scene_name: scene_file_name,
      timeline: { objects: [] },
    };
    const json = JSON.stringify(scene_schema);
    const blob = new Blob([json], { type: "application/json" });
    const file_name = `${uuid}.json`;

    const form_data = new FormData();

    form_data.append("uuid_idempotency_token", uuid);
    form_data.append("file", blob, file_name);
    form_data.append("source", "file");
    form_data.append("type", "scene_json");
    form_data.append("source", "file");

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: form_data,
    });

    if (!response.ok) {
      throw new APIManagerResponseError("Failed to Send GLB Data");
    } else {
      const json_data = await response.json();
      // example response {"success":true,"media_file_token":"m_r1ztnn501g2rn0vv2np08nd6zy2fvt"}
      console.log(`saveSceneAndTimeLineState: ${JSON.stringify(json_data)}`);
      // should return the same token if it is same file else new token.
      return json_data; // or handle the response as appropriate
    }
  }

  public async uploadMedia(
    blob: any,
    fileName: string,
  ): Promise<APIManagerResponseSuccess> {
    const url = `${this.baseUrl}/v1/media_uploads/upload`;
    let uuid = uuidv4();

    const formData = new FormData();
    formData.append("uuid_idempotency_token", uuid);
    formData.append("file", blob, fileName);
    formData.append("source", "file");
    formData.append("type", "video");
    formData.append("source", "file");

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
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

  public async batchGetMedia(media_tokens: []): Promise<string> {
    return "";
  }

  // Function to save or update the scene
  // it will always return a boolean success  and the media_file_token
  // they take an optional media_file_token as a parameter for the file to overwrite, which must belong to the user.
  // If it's an anonymous user, we check the anonymous visitor token/cookie

  // async saveSceneState2(
  //   scene: THREE.Scene,
  //   timeline: TimelineDataState,
  //   scene_name: string,
  //   scene_media_file_token: string | null = null,
  // ): Promise<string> {
  //     // create new scene

  //     let file = await this.gltfExport(scene);
  //     let response = await this.uploadGLB(file);
  //     let success = response["success"];
  //     if (success) {
  //         let media_file_token = response["media_file_token"];
  //         console.log(`media file token: ${media_file_token}`)
  //         const result = await this._saveSceneAndTimelineToJSONSpec(media_file_token,scene_name, timeline);
  //         return result
  //      }

  //     throw Error("Saving the Scene Resulted in an Error Success False");
  // }

  // // For JSON files.
  // // Form-multipart POST with parameters:
  // // uuid_idempotency_token
  // // file
  // // media_file_token (optional; the file to replace if present)
  // async _saveSceneAndTimelineToJSONSpec(
  //   media_file_token: string,
  //   scene_file_name: string,
  //   timeline: TimelineDataState,
  // ): Promise<string> {
  //   const url = `${this.baseUrl}/v1/media_files/write/scene_file`;
  //   let uuid = uuidv4();

  //   // turn json into a blob
  //   const file_test = {"glb_media_file_id":media_file_token,"name":scene_file_name,"entities":[], "timeline":""}

  //   const json = JSON.stringify(file_test);
  //   const blob = new Blob([json], {type: 'application/json'});
  //   const fileName = `${uuid}-${scene_file_name}.json`;

  //   const formData = new FormData();

  //   formData.append("uuid_idempotency_token", uuid);
  //   formData.append("file", blob, fileName);
  //   formData.append("source", "file");
  //   formData.append("type", "scene_json");
  //   formData.append("source", "file");

  //   const response = await fetch(url, {
  //     method: "POST",
  //     credentials: "include",
  //     headers: {
  //       Accept: "application/json",
  //     },
  //     body: formData,
  //   });

  //   if (!response.ok) {
  //     throw new Error("Failed to Send Data");
  //   }

  //   console.log(`saveSceneAndTimelineToJSONSpecResponse: ${response}`)

  //   return response.json(); // or handle the response as appropriate
  // }

  // // media_file_token that describes the scene
  // async loadScene(media_file_token: string): Promise<string> {
  //   let api_base_url = "https://api.fakeyou.com";
  //   let url = `${api_base_url}/v1/media_files/file/${media_file_token}`
  //   let response = await fetch(url);
  //   let json = await JSON.parse(await response.text());
  //   let bucketPath = json["media_file"]["public_bucket_path"];
  //   let media_base_url = "https://storage.googleapis.com/vocodes-public"
  //   let media_url = `${media_base_url}${bucketPath}` // gets you a bucket path

  //   let fileResponse = await fetch(media_url);

  //   if (!fileResponse.ok) {
  //     throw new Error("Failed to download file");
  //   }
  //   // Convert the response to a Blob
  //   let blob = await fileResponse.blob();
  //   const json_value:string = await new Promise((resolve, reject) => {
  //     let reader = new FileReader();
  //     reader.onloadend = () => resolve(JSON.parse(reader.result as string));
  //     reader.onerror = reject;
  //     reader.readAsText(blob);
  //   });
  //   console.log(json_value)
  //   return json_value
  // }

  // // Provides bucket path to the actual file to download from the media file
  // async getMediaFile(media_file_token: string): Promise<string> {
  //   let api_base_url = "https://api.fakeyou.com";
  //   let url = `${api_base_url}/v1/media_files/file/${media_file_token}`
  //   let response = await fetch(url);
  //   let json = await JSON.parse(await response.text());
  //   let bucketPath = json["media_file"]["public_bucket_path"];
  //   let media_base_url = "https://storage.googleapis.com/vocodes-public"
  //   let media_url = `${media_base_url}${bucketPath}` // gets you a bucket path
  //   // TODO get it as binary.
  //   return media_url
  // }

  // async gltfExport2(scene: THREE.Scene) {
  //   let gltfExporter = new GLTFExporter();
  //   let uuid = uuidv4();
  //   // save the scene to keep ids positions etc
  //   let result = await gltfExporter.parseAsync(scene);
  //   const file = new File([JSON.stringify(result)], `${uuid}.glb`, {
  //     type: "application/json",
  //   });
  //   return file;
  // }
  // // two core functions to upload things to the server and get id's
  // async uploadMedia2(blob: any, fileName: string): Promise<string> {
  //   const url = `${this.baseUrl}/v1/media_uploads/upload`;
  //   let uuid = uuidv4();
  //   const formData = new FormData();
  //   formData.append("uuid_idempotency_token", uuid);
  //   formData.append("file", blob, fileName);
  //   formData.append("source", "file");
  //   formData.append("type", "video");
  //   formData.append("source", "file");
  //   const response = await fetch(url, {
  //     method: "POST",
  //     credentials: "include",
  //     headers: {
  //       Accept: "application/json",
  //     },
  //     body: formData,
  //   });

  //   if (!response.ok) {
  //     throw new Error("Failed to Send Data");
  //   }
  //   return response.json();
  // }

  /**
  To save the scene as a file get the id back to serialize
  /v1/media_files/write/engine_asset
  An upsert for files. 
  If the file exists, it'll check ownership prior to overwriting.
  For GLB, GLTF, BVH, FBX, etc. game engine-type files.
  Form-multipart POST with parameters:
  uuid_idempotency_token 
  file
  media_file_token (optional; the file to replace if present)
  media_file_subtype (optional; mixamo, mocap_net, scene_import, animation_only)
  media_file_class (audio, image, video, animation, character, prop, scene, unknown)
  **/
  // async uploadGLB2(file: File, scene_media_file_token:string | null): Promise<string> {
  //   const url = `${this.baseUrl}/v1/media_files/write/engine_asset`;
  //   let uuid = uuidv4();
  //   const formData = new FormData();
  //   formData.append("uuid_idempotency_token", uuid);

  //   // update existing scene otherwise create new scene and use it's media_file_id
  //   if (scene_media_file_token != null) {
  //     formData.append("media_file_token", scene_media_file_token);
  //   }

  //   formData.append("file", file);
  //   formData.append("source", "file");
  //   formData.append("media_file_subtype", "scene_import");
  //   formData.append("media_file_class", "scene");
  //   const response = await fetch(url, {
  //     method: "POST",
  //     credentials: "include",
  //     headers: {
  //       Accept: "application/json",
  //     },
  //     body: formData,
  //   });

  //   if (!response.ok) {
  //     throw new Error("Failed to Send Data");
  //   }
  //   return response.json(); // or handle the response as appropriate
  // }
}

export default APIManager;
