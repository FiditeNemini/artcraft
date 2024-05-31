import { StoryTellerProxyScene } from "../proxy/storyteller_proxy_scene";
import { StoryTellerProxyTimeline } from "../proxy/storyteller_proxy_timeline";
import { hideEditorLoader, showEditorLoader } from "../signals";
import Editor from "./editor";

export type EditorInitializeConfig = {
    sceneToken: string;
};

export class SaveManager {
    editor: Editor
    constructor(editor: Editor) {
        this.editor = editor;
    }

    public async saveScene({
        sceneTitle,
        sceneToken,
    }: {
        sceneTitle: string;
        sceneToken?: string;
    }): Promise<string> {
        this.editor.generating_preview = true; // Set this to true to stop control panel from flipping out.
        // remove controls when saving scene.
        this.editor.removeTransformControls();
        showEditorLoader();

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
            timeline: timeline_json,
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
        await proxyScene.loadFromSceneJson(scene_json["scene"], scene_json["version"]);
        this.editor.version = scene_json["version"];
        this.editor.cam_obj = this.editor.activeScene.get_object_by_name(this.editor.camera_name);
        this.editor.cam_obj?.layers.set(1);
        this.editor.cam_obj?.children.forEach(child => {
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
        this.editor.timeline.scrub({ data: { currentTime: 0 } })
    }
}
