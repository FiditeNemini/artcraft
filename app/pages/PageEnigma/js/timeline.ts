import { AnyJson } from "three/examples/jsm/nodes/core/constants.js";
import { ClipUI } from "../datastructures/clips/clip_ui";

import Scene from "./scene.js";
import AudioEngine from "./audio_engine";
import TransformEngine from "./transform_engine";
import LipSyncEngine from "./lip_sync_engine";
import AnimationEngine from "./animation_engine";

import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "../Queue/QueueNames";
import { toEngineActions } from "../Queue/toEngineActions";
import { fromEngineActions } from "../Queue/fromEngineActions";
import { ClipGroup, ClipType } from "~/pages/PageEnigma/models/track";
import { MediaItem } from "~/pages/PageEnigma/models";
import Editor from "~/pages/PageEnigma/js/editor";

// Every object uuid / entity has a track.
export class TimelineDataState {
  timeline_items: ClipUI[];
  scrubber_frame_position: number;
  constructor(
    timeline_items: ClipUI[] = [],
    scrubber_frame_position: number = 0,
  ) {
    this.timeline_items = timeline_items;
    this.scrubber_frame_position = scrubber_frame_position;
  }
}

export class TimeLine {
  editorEngine: Editor;
  timeline_items: ClipUI[];

  timeline_limit: number;
  absolute_end: number;
  scrubber_frame_position: number;
  is_playing: boolean;

  // plays audio
  audio_engine: AudioEngine;
  // key framing
  transform_engine: TransformEngine;
  // animation engine
  animation_engine: AnimationEngine;
  // lip sync engine
  lipSync_engine: LipSyncEngine;
  characters: { [key: string]: ClipGroup };

  scene: Scene;

  current_time: number;

  // ensure that the elements are loaded first.
  constructor(
    editor: Editor,
    audio_engine: AudioEngine,
    transform_engine: TransformEngine,
    lipsync_engine: LipSyncEngine,
    animation_engine: AnimationEngine,
    scene: Scene,
  ) {
    this.editorEngine = editor;
    this.timeline_items = [];
    this.characters = {};
    this.absolute_end = 60 * 12;
    this.timeline_limit = 0; // 5 seconds

    this.is_playing = false;
    this.scrubber_frame_position = 0; // in frames into the tl

    // this will be used to play the audio clips
    this.audio_engine = audio_engine;
    this.transform_engine = transform_engine;
    this.lipSync_engine = lipsync_engine;
    this.animation_engine = animation_engine;

    this.scene = scene;

    Queue.subscribe(
      QueueNames.TO_ENGINE,
      this.handleTimelineActions.bind(this),
    );

    this.current_time = 0;
  }

  public async updateUI() {
    Queue.publish({
      queueName: QueueNames.FROM_ENGINE,
      action: fromEngineActions.UPDATE_TIME_LINE,
      data: this.timeline_items,
    });
  }

  public async pushEvent(action: fromEngineActions, data: any) {
    //this.current_time += 0.75;
    Queue.publish({
      queueName: QueueNames.FROM_ENGINE,
      action: fromEngineActions.UPDATE_TIME,
      data: data,
    });
  }

  public async handleTimelineActions(data: any) {
    const action = data["action"];
    switch (action) {
      case toEngineActions.ADD_KEYFRAME:
        await this.addKeyFrame(data);
        break;
      case toEngineActions.UPDATE_KEYFRAME:
        await this.updateKeyFrame(data);
        break;
      case toEngineActions.DELETE_KEYFRAME:
        await this.deleteKeyFrame(data);
        break;
      case toEngineActions.ADD_CLIP:
        await this.addClip(data);
        break;
      case toEngineActions.DELETE_CLIP:
        await this.deleteClip(data);
        break;
      case toEngineActions.UPDATE_CLIP:
        await this.updateClip(data);
        break;
      case toEngineActions.UPDATE_TIME:
        await this.scrub(data);
        break;
      case toEngineActions.MUTE:
        await this.mute(data, false);
        break;
      case toEngineActions.UNMUTE:
        await this.mute(data, true);
        break;
      case toEngineActions.ADD_CHARACTER:
        await this.addCharacter(data);
        break;
      case toEngineActions.ADD_OBJECT:
        await this.addObject(data);
        break;
      case toEngineActions.ADD_SHAPE:
        await this.addShape(data);
        break;
      default:
        console.log("Action Not Wired", action);
    }
  }

  public async addCharacter(data: { data: MediaItem }) {
    const media_id = data.data.media_id;
    const name = data.data.name;

    let new_data = {...data.data};

    const obj = await this.scene.load_glb(media_id);
    obj.userData["name"] = name;
    obj.name = name;
    const object_uuid = obj.uuid;

    this.characters[object_uuid] = ClipGroup.CHARACTER;

    new_data["object_uuid"] = object_uuid;
    Queue.publish({
      queueName: QueueNames.FROM_ENGINE,
      action: fromEngineActions.UPDATE_CHARACTER_ID,
      data: new_data,
    });

    this.addPlayableClip(
      new ClipUI(
        data.data["version"],
        ClipType.FAKE,
        ClipGroup.CHARACTER,
        "Default",
        media_id,
        obj.uuid,
        obj.uuid,
        name,
        0,
        0,
        0,
      ),
    );
  }

  public async addObject(data: { data: MediaItem }) {
    const media_id = data.data.media_id;
    const name = data.data.name;
    const obj = await this.scene.load_glb(media_id);
    obj.userData["name"] = name;
    obj.name = name;
  }

  public async addShape({ data }: { data: MediaItem }) {
    this.editorEngine.create_parim(data.media_id);
  }

  public async addKeyFrame(data: any) {
    // KeyFrame Object
    // version: number;
    // clip_uuid: string;
    // group: ClipGroup;
    // object_uuid?: string;
    // offset: number;
    // position: XYZ
    // rotation: XYZ;
    // scale: XYZ;
    // selected?: boolean;
    const data_json = data["data"];
    const uuid = data_json["object_uuid"];
    const keyframe_uuid = data_json["keyframe_uuid"];

    let object_name = this.scene.get_object_by_uuid(uuid)?.name;
    if (object_name === undefined) {
      object_name = "undefined";
    }

    const new_item = this.transform_engine.addFrame(
      uuid,
      this.absolute_end,
      data_json["position"],
      data_json["rotation"],
      data_json["scale"],
      data_json["offset"],
      data_json["keyframe_uuid"],
    );

    await this.addPlayableClip(
      new ClipUI(
        data_json["version"],
        ClipType.TRANSFORM,
        data_json["group"],
        object_name,
        "",
        keyframe_uuid,
        uuid,
        object_name,
        0,
        this.absolute_end,
        data_json["offset"],
      ),
    );

    this.scene.createPoint(data_json["position"], data_json["keyframe_uuid"]);
  }

  public deleteObject(object_uuid: string) {
    this.timeline_items = this.timeline_items.filter(
      (element) => element.object_uuid !== object_uuid,
    );
    // Update react land here.
  }

  public async addClip(data: any) {
    const object_uuid = data["data"]["object_uuid"];
    const media_id = data["data"]["media_id"];
    const name = data["data"]["name"];
    const group = data["data"]["group"];
    const version = data["data"]["group"];
    const type = data["data"]["type"];
    const offset = data["data"]["offset"];
    const end_offset = data["data"]["length"] + offset;
    let object_name = this.scene.get_object_by_uuid(object_uuid)?.name;
    const clip_uuid = data["data"]["clip_uuid"];

    if (object_name === undefined) {
      object_name = "Undefined.";
    }

    switch (type) {
      case "animation":
        this.animation_engine.load_object(object_uuid, media_id, name);
        break;
      case "transform":
        this.transform_engine.loadObject(object_uuid, data["data"]["length"]);
        break;
      case "audio":
        if (group === "character") {
          this.lipSync_engine.load_object(object_uuid, media_id);
          // media id for this as well it can be downloaded
          this.addPlayableClip(
            new ClipUI(
              version,
              ClipType.AUDIO,
              ClipGroup.CHARACTER,
              name,
              media_id,
              clip_uuid,
              object_uuid,
              object_name,
              offset,
              end_offset,
            ),
          );
          return;
        } else {
          this.audio_engine.loadClip(media_id);
        }
        break;
    }

    // media id for this as well it can be downloaded
    this.addPlayableClip(
      new ClipUI(
        version,
        type,
        group,
        name,
        media_id,
        clip_uuid,
        object_uuid,
        object_name,
        offset,
        end_offset,
      ),
    );
  }

  public async deleteKeyFrame(data: any) {
    const keyframe_uuid = data["data"]["keyframe_uuid"];
    const object_uuid = data["data"]["object_uuid"];
    this.transform_engine.clips[object_uuid].removeKeyframe(keyframe_uuid);
    this.scene.deletePoint(keyframe_uuid);
  }

  public async updateKeyFrame(data: any) {
    const keyframe_uuid = data["data"]["keyframe_uuid"];
    const keyframe_offset = data["data"]["offset"];
    const object_uuid = data["data"]["object_uuid"];
    this.transform_engine.clips[object_uuid].setOffset(
      keyframe_uuid,
      keyframe_offset,
    );
  }

  public async updateClip(data: any) {
    // only length and offset changes here.
    const object_uuid = data["data"]["object_uuid"];
    const media_id = data["data"]["media_id"];
    const offset = data["data"]["offset"];
    const length = data["data"]["length"] + offset;

    for (const element of this.timeline_items) {
      if (
        element.media_id === media_id &&
        element.object_uuid === object_uuid
      ) {
        element.length = length;
        element.offset = offset;
      }
    }
  }

  public async deleteClip(data: any) {
    const json_data = data["data"];
    const object_uuid = data["data"]["object_uuid"];
    const media_id = data["data"]["media_id"];
    const type = data["type"];

    for (let i = 0; i < this.timeline_items.length; i++) {
      const element = this.timeline_items[i];
      if (
        element.media_id === media_id &&
        element.object_uuid === object_uuid
      ) {
        this.timeline_items.splice(i, 1);
        break;
      }
    }
  }

  public async scrubberUpdate(data: any) {
    console.log(data);
  }

  public async mute(data: any, isMute: boolean) {
    this.timeline_items.forEach((element) => {
      if (element.group === data.data["group"]) {
        element.should_play = isMute;
      }
    });
  }

  public async addPlayableClip(clip: ClipUI): Promise<void> {
    this.timeline_items.push(clip);
  }

  // when given a media id item it will create the clip.
  // Then the clip will be loaded by the engines, if they come from outside of the loaded scene.
  public async createClipOffset(
    media_id: string,
    object_uuid: string,
    type: string,
  ): Promise<void> {
    // use engine to load based off media id and type animation | transform |
  }

  // this will update the state of the clips based off uuid easing?
  public async updatePlayableClip(
    clip_uuid: string,
    updates: AnyJson,
  ): Promise<void> {}

  public async deletePlayableClip(clip_uuid: string): Promise<void> {}

  public async scrub(data: any): Promise<void> {
    if (this.is_playing) {
      return;
    }
    const value = Math.floor(data["data"]["currentTime"])
    this.setScrubberPosition(value);
    this.update();
  }

  public async stepFrame(frames: number) {
    this.update();
    this.scrubber_frame_position += frames;
    this.pushEvent(fromEngineActions.UPDATE_TIME, {
      currentTime: this.scrubber_frame_position,
    });
  }

  public async scrubberDidStop(offset_frame: number) {}
  // public streaming events into the timeline from
  public async setScrubberPosition(offset: number) {
    this.scrubber_frame_position = offset; // in ms
  }

  // should play from the clip that is closest to the to scrubber
  public async play(): Promise<void> {
    console.log(`Starting Timeline`);
    this.is_playing = true;
  }

  private async resetScene() {
    for (const element of this.timeline_items) {
      if (element.type === ClipType.TRANSFORM) {
        const object = this.scene.get_object_by_uuid(element.object_uuid);
        if (object && this.transform_engine.clips[element.object_uuid]) {
          this.transform_engine.clips[element.object_uuid].reset(object);
        }
      } else if (
        element.type === ClipType.AUDIO &&
        element.group !== ClipGroup.CHARACTER
      ) {
        this.audio_engine.loadClip(element.media_id);
        this.audio_engine.stopClip(element.media_id);
      } else if (element.type === ClipType.ANIMATION) {
        this.animation_engine.clips[
          element.object_uuid + element.media_id
        ].stop();
      } else if (
        element.type === ClipType.AUDIO &&
        element.group === ClipGroup.CHARACTER
      ) {
        this.lipSync_engine.clips[
          element.object_uuid + element.media_id
        ].reset();
      }
    }
  }

  private getEndPoint(): number {
    let longest = 0;
    for (const element of this.timeline_items) {
      if (longest < element.length) {
        longest = element.length;
      }
    }
    return longest;
  }

  // called by the editor update loop on each frame
  public async update(isRendering = false): Promise<boolean> {
    //if (this.is_playing === false) return; // start and stop
    this.timeline_limit = this.getEndPoint();
    if (this.is_playing) {
      this.current_time += 1; // This fixes fps issues at 60.
      this.pushEvent(fromEngineActions.UPDATE_TIME, {
        currentTime: this.current_time,
      });
      this.scrubber_frame_position = this.current_time;
    }

    if (this.scrubber_frame_position <= 0) {
      await this.resetScene();
    }

    //this.scrubber_frame_position += 1;
    //2. allow stopping.
    //3. smallest unit is a frame and it is set by the scene and is in fps, our videos will be 60fps but we can reprocess them using the pipeline.
    for (const element of this.timeline_items) {
      if (
        element.offset <= this.scrubber_frame_position &&
        this.scrubber_frame_position <= element.length &&
        element.should_play === true
      ) {
        // run async
        // element.play()
        // remove the element from the list
        const object = this.scene.get_object_by_uuid(element.object_uuid);
        if (element.type === ClipType.TRANSFORM) {
          if (object && this.transform_engine.clips[element.object_uuid]) {
            this.transform_engine.clips[element.object_uuid].step(
              object,
              element.offset,
              this.scrubber_frame_position,
            );
            element.length =
              this.transform_engine.clips[element.object_uuid].length;
          }
        } else if (
          element.type === ClipType.AUDIO &&
          element.group !== ClipGroup.CHARACTER &&
          this.is_playing
        ) {
          if (this.scrubber_frame_position + 1 >= element.length) {
            this.audio_engine.stopClip(element.media_id);
          } else {
            this.audio_engine.playClip(element.media_id);
          }
        } else if (
          element.type === ClipType.AUDIO &&
          element.group === ClipGroup.CHARACTER &&
          this.is_playing
        ) {
          // we will remove this when we know which group it will come from character + audio === lip sync audio.
          if (this.scrubber_frame_position + 1 >= element.length) {
            this.lipSync_engine.clips[
              element.object_uuid + element.media_id
            ].stop();
          } else if (object) {
            await this.lipSync_engine.clips[
              element.object_uuid + element.media_id
            ].play(object);
            this.lipSync_engine.clips[
              element.object_uuid + element.media_id
            ].step();
          }
        } else if (element.type === ClipType.ANIMATION) {
          if (object) {
            await this.animation_engine.clips[
              object.uuid + element.media_id
            ].play(object);
            let fps = 60;
            this.animation_engine.clips[object.uuid + element.media_id].step(
              this.scrubber_frame_position / fps, // Double FPS for best result.
            );
          }
        }
        //this.timelineItems = this.timelineItems.filter(item => item !== element)
      }
    }

    if (
      this.scrubber_frame_position >= this.timeline_limit &&
      this.is_playing
    ) {
      await this.stop();
      return true;
    }

    return false;
  }

  private async stop(): Promise<void> {
    await this.resetScene();
    this.is_playing = false;
    console.log(`Stopping Timeline`);
    this.current_time = 0;
    this.pushEvent(fromEngineActions.UPDATE_TIME, {
      currentTime: this.current_time,
    });
  }
}