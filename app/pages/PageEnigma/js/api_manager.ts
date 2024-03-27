import { v4 as uuidv4 } from "uuid";
import { Scene } from "../datastructures/scene/scene_object";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TimelineCurrentReactState } from "./timeline";

// Basically the data will exist on the database
class APIManager {
  baseUrl: String;

  constructor() {
    this.baseUrl = "https://api.fakeyou.com";
    //this.baseUrl = "http://localhost:12345"
  }

  // Function to save or update the scene
  // it will always return a boolean success  and the media_file_token
  // they take an optional media_file_token as a parameter for the file to overwrite, which must belong to the user.
  //If it's an anonymous user, we check the anonymous visitor token/cookie
  
  async saveSceneState(
    scene: THREE.Scene,
    timeline: TimelineCurrentReactState,
    media_file_token: string | null = null,
  ): Promise<string> {
      // create new scene.
      let file = await this.gltfExport(scene);
      let response = await this.uploadGLB(file);
      let success = response["success"];
      if (success) {
        let media_file_token = response["media_file_token"];
        
        console.log(`media file token: ${media_file_token}`)

        const result = await this._saveSceneAndTimelineToJSONSpec(media_file_token, timeline);
        return result
      } 
      
      throw Error("Saving the Scene Resulted in an Error Success False");
  }
  
  // For JSON files.
  // Form-multipart POST with parameters:
  // uuid_idempotency_token
  // file
  // media_file_token (optional; the file to replace if present)
  async _saveSceneAndTimelineToJSONSpec(
    media_file_token: string,
    timeline: TimelineCurrentReactState,
  ): Promise<string> {
    const url = `${this.baseUrl}/v1/media_files/write/scene_file`;
    let uuid = uuidv4();

    // turn json into a blob
    const file_test = {"glb_media_file_id":media_file_token,"entities":[], "timeline":""}
    const json = JSON.stringify(file_test);
    const blob = new Blob([json], {type: 'application/json'});
    const fileName = `${uuid}.json`;

    const formData = new FormData();

    formData.append("uuid_idempotency_token", uuid);
    formData.append("file", blob, fileName);
    formData.append("source", "file");
    formData.append("type", "scene_json");
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
      throw new Error("Failed to Send Data");
    }

    console.log(`saveSceneAndTimelineToJSONSpecResponse: ${response}`)

    return response.json(); // or handle the response as appropriate
  }

  // media_file_token that describes the scene
  async loadScene(media_file_token: string): Promise<string> { 
    let api_base_url = "https://api.fakeyou.com";
    let url = `${api_base_url}/v1/media_files/file/${media_file_token}`
    let response = await fetch(url);
    let json = await JSON.parse(await response.text());
    let bucketPath = json["media_file"]["public_bucket_path"];
    let media_base_url = "https://storage.googleapis.com/vocodes-public"
    let media_url = `${media_base_url}${bucketPath}` // gets you a bucket path 
  
    let fileResponse = await fetch(media_url);

    if (!fileResponse.ok) {
      throw new Error("Failed to download file");
    }
    // Convert the response to a Blob
    let blob = await fileResponse.blob();
    const json_value:string = await new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onloadend = () => resolve(JSON.parse(reader.result as string));
      reader.onerror = reject;
      reader.readAsText(blob);
    });
    console.log(json_value)
    return json_value
  } 

  // Provides bucket path to the actual file to download from the media file
  async getMediaFile(media_file_token: string): Promise<string> { 
    let api_base_url = "https://api.fakeyou.com";
    let url = `${api_base_url}/v1/media_files/file/${media_file_token}`
    let response = await fetch(url);
    let json = await JSON.parse(await response.text());
    let bucketPath = json["media_file"]["public_bucket_path"];
    let media_base_url = "https://storage.googleapis.com/vocodes-public"
    let media_url = `${media_base_url}${bucketPath}` // gets you a bucket path 
    // TODO get it as binary.
    return media_url
  }
  
  async batchGetMedia(media_tokens: []): Promise<string> {
    return "";
  }

  async gltfExport(scene: THREE.Scene) {
    let gltfExporter = new GLTFExporter();
    let uuid = uuidv4();
    // save the scene to keep ids positions etc
    let result = await gltfExporter.parseAsync(scene);
    const file = new File([JSON.stringify(result)], `${uuid}.glb`, {
      type: "application/json",
    });
    return file;
  }
  // two core functions to upload things to the server and get id's
  async uploadMedia(blob: any, fileName: string): Promise<string> {
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
      throw new Error("Failed to Send Data");
    }
    return response.json(); 
  }

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
  async uploadGLB(file: File): Promise<string> {
    const url = `${this.baseUrl}/v1/media_files/write/engine_asset`;
    let uuid = uuidv4();
    const formData = new FormData();
    formData.append("uuid_idempotency_token", uuid);
    formData.append("file", file);
    formData.append("source", "file");
    formData.append("media_file_subtype", "scene_import");
    formData.append("media_file_class", "scene");
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to Send Data");
    }
    return response.json(); // or handle the response as appropriate
  }
}

export default APIManager;
