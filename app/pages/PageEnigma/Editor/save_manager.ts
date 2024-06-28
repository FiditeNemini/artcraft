import * as THREE from "three";
import { SceneGenereationMetaData } from "../models/sceneGenerationMetadata";
import { StoryTellerProxyScene } from "../proxy/storyteller_proxy_scene";
import { StoryTellerProxyTimeline } from "../proxy/storyteller_proxy_timeline";
import {
  setCameraAspectRatio,
  hideEditorLoader,
  restoreSceneGenerationMetadata,
  showEditorLoader,
  globalIPAMediaToken,
} from "../signals";
import Editor from "./editor";
import { getArtStyle } from "~/enums";
export type EditorInitializeConfig = {
  sceneToken: string;
};

// need to move this into the
export class SaveManager {
  editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;
  }

  // JSON structure
  public async saveData({
    sceneGenerationMetadata,
  }: {
    sceneTitle: string;
    sceneToken?: string;
    sceneGenerationMetadata: SceneGenereationMetaData;
  }): Promise<string> {
    const proxyScene = new StoryTellerProxyScene(
      this.editor.version,
      this.editor.activeScene,
    );
    const scene_json = await proxyScene.saveToScene(this.editor.version);

    const proxyTimeline = new StoryTellerProxyTimeline(
      this.editor.version,
      this.editor.timeline,
      this.editor.transform_engine,
      this.editor.animation_engine,
      this.editor.audio_engine,
      this.editor.lipsync_engine,
      this.editor.emotion_engine,
    );
    const timeline_json = await proxyTimeline.saveToJson();

    const save_data = {
      version: this.editor.version,
      scene: scene_json,
      ...sceneGenerationMetadata,
      timeline: timeline_json,
      camera_data: {
        position: this.editor.camera?.position,
        rotation: this.editor.camera?.rotation,
      },
    };

    return JSON.stringify(save_data);
  }

  // TODO Move this function into scene manager.
  public async saveScene({
    sceneTitle,
    sceneToken,
    sceneGenerationMetadata,
  }: {
    sceneTitle: string;
    sceneToken?: string;
    sceneGenerationMetadata: SceneGenereationMetaData;
  }): Promise<string> {
    this.editor.generating_preview = true; // Set this to true to stop control panel from flipping out.
    // remove controls when saving scene.
    this.editor.utils.removeTransformControls();
    showEditorLoader();

    const proxyScene = new StoryTellerProxyScene(
      this.editor.version,
      this.editor.activeScene,
    );
    const scene_json = await proxyScene.saveToScene(this.editor.version);
    console.log(scene_json);
    const proxyTimeline = new StoryTellerProxyTimeline(
      this.editor.version,
      this.editor.timeline,
      this.editor.transform_engine,
      this.editor.animation_engine,
      this.editor.audio_engine,
      this.editor.lipsync_engine,
      this.editor.emotion_engine,
    );
    const timeline_json = await proxyTimeline.saveToJson();

    const save_data = {
      version: this.editor.version,
      scene: scene_json,
      ...sceneGenerationMetadata,
      timeline: timeline_json,
      camera_data: {
        position: this.editor.camera?.position,
        rotation: this.editor.camera?.rotation,
      },
    };

    // TODO turn scene information into and object ...
    let sceneThumbnail = undefined;

    if (this.editor.renderer) {
      const imgData = this.editor.renderer.domElement.toDataURL();
      const response = await fetch(imgData); // Fetch the data URL
      sceneThumbnail = await response.blob(); // Convert to Blob
    }

    const result = await this.editor.api_manager.saveSceneState({
      saveJson: JSON.stringify(save_data),
      sceneTitle,
      sceneToken,
      sceneThumbnail,
    });

    hideEditorLoader();

    this.editor.generating_preview = false; // FIX THIS LATER WITH VICCCCCCCCCCCCCCCTORRRRRRRR

    return result;
  }

  // TODO Refactor remove editor.
  public async loadScene(scene_media_token: string) {
    showEditorLoader();

    this.editor.current_scene_media_token = scene_media_token;

    const scene_json = await this.editor.api_manager
      .loadSceneState(this.editor.current_scene_media_token)
      .catch((err) => {
        hideEditorLoader();
        throw err;
      });

    const proxyScene = new StoryTellerProxyScene(
      this.editor.version,
      this.editor.activeScene,
    );

    await proxyScene.loadFromSceneJson(
      scene_json["scene"],
      scene_json["version"],
    );

    const camera_data = scene_json["camera_data"];
    if (camera_data && this.editor.camera) {
      const camera_position: THREE.Vector3 = camera_data["position"];
      const camera_rotation: THREE.Euler = camera_data["rotation"];

      this.editor.camera.position.copy(camera_position);
      this.editor.camera.rotation.copy(camera_rotation);
    }

    // For Remixing Scenes.
    // this calls the signal function to propagate the data to the UI
    restoreSceneGenerationMetadata(scene_json);
    // these propogate the values into the editor
    if (scene_json.globalIpAdapterImageMediaToken) {
      // this should be populated right after
      globalIPAMediaToken.value = scene_json.globalIpAdapterImageMediaToken;
    }
    if (scene_json.positivePrompt) {
      this.editor.positive_prompt = scene_json.positivePrompt;
    }
    if (scene_json.negativePrompt) {
      this.editor.negative_prompt = scene_json.negativePrompt;
    }
    if (scene_json.artisticStyle) {
      this.editor.art_style = getArtStyle(scene_json["artisticStyle"]);
    }
    if (scene_json.cameraAspectRatio) {
      //editor propagation
      this.editor.changeRenderCameraAspectRatio(scene_json.cameraAspectRatio);
      //signal propagation
      setCameraAspectRatio(scene_json.cameraAspectRatio);
    }

    this.editor.version = scene_json["version"];
    this.editor.cam_obj = this.editor.activeScene.get_object_by_name(
      this.editor.camera_name,
    );

    this.editor.cam_obj?.layers.set(1);
    this.editor.cam_obj?.children.forEach((child) => {
      child.layers.set(1);
    });

    const proxyTimeline = new StoryTellerProxyTimeline(
      this.editor.version,
      this.editor.timeline,
      this.editor.transform_engine,
      this.editor.animation_engine,
      this.editor.audio_engine,
      this.editor.lipsync_engine,
      this.editor.emotion_engine,
    );
    await proxyTimeline.loadFromJson(scene_json["timeline"]);

    this.editor.timeline.checkEditorCanPlay();

    hideEditorLoader();
    // TODO figure out if this is a bug.
    this.editor.timeline.scrub({ data: { currentTime: 0 } });
  }
}
