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
import { ClipGroup, ClipType } from "~/pages/PageEnigma/models";

// Every object uuid / entity has a track.
export class TimelineCurrentState {
  is_editable: boolean;
  selected_object_ID: number;
  constructor() {
    this.is_editable = true; // can add clips to it
    this.selected_object_ID = 0;
  }
}

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

  scene: Scene;

  current_time: number;
  // ensure that the elements are loaded first.
  constructor(
    audio_engine: AudioEngine,
    transform_engine: TransformEngine,
    lipsync_engine: LipSyncEngine,
    animation_engine: AnimationEngine,
    scene: Scene,
  ) {
    this.timeline_items = [];
    this.absolute_end = 60 * 12;
    this.timeline_limit = this.absolute_end; // 5 seconds

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
    // TODO: How to move the timeline should put in update.
    // setInterval(()=> {
    //     this.current_time +=1
    //     this.pushEvent(fromEngineActions.UPDATE_TIME, { currentTime: this.current_time })
    // },50)
  }

  public async pushEvent(action: fromEngineActions, data: any) {
    this.current_time += 1;
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
        await this.mute(data);
        break;
      default:
        console.log("Action Not Wired");
    }
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

    let object_name = this.scene.get_object_by_uuid(uuid)?.name;
    if (object_name == undefined) {
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
    if (new_item) {
      await this.addPlayableClip(
        new ClipUI(
          data_json["version"],
          ClipType.TRANSFORM,
          data_json["group"],
          object_name,
          "",
          uuid,
          0,
          this.absolute_end,
        ),
      );
    }
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

    switch (type) {
      case "animation":
        this.animation_engine.load_object(object_uuid, media_id, name);
        break;
      case "transform":
        this.transform_engine.loadObject(object_uuid, data["data"]["length"]);
        break;
      case "audio":
        if (group == "character") {
          this.lipSync_engine.load_object(object_uuid, media_id);
          // media id for this as well it can be downloaded
          this.addPlayableClip(
            new ClipUI(
              version,
              ClipType.AUDIO,
              group,
              name,
              media_id,
              object_uuid,
              offset,
              end_offset,
            ),
          );
          return;
        } else {
          console.log("Audio!");
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
        object_uuid,
        offset,
        end_offset,
      ),
    );
  }

  public async deleteKeyFrame(data: any) {
    const keyframe_uuid = data["data"]["keyframe_uuid"];
    const object_uuid = data["data"]["object_uuid"];
    this.transform_engine.clips[object_uuid].removeKeyframe(keyframe_uuid);
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
    console.log(data);

    const object_uuid = data["data"]["object_uuid"];
    const media_id = data["data"]["media_id"];
    const offset = data["data"]["offset"];
    const length = data["data"]["length"] + offset;

    for (const element of this.timeline_items) {
      if (element.media_id == media_id && element.object_uuid == object_uuid) {
        element.length = length;
        element.offset = offset;
      }
    }
  }
  public async deleteClip(data: any) {
    console.log(data);
  }

  public async scrubberUpdate(data: any) {
    console.log(data);
  }

  public async mute(data: any) {
    console.log(data);
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
    this.update();
    this.setScrubberPosition(data["data"]["currentTime"]);
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
    this.timeline_limit = this.getEndPoint();
    for (const element of this.timeline_items) {
      if (element.type == "transform") {
        const object = this.scene.get_object_by_uuid(element.object_uuid);
        if (object && this.transform_engine.clips[element.object_uuid]) {
          this.transform_engine.clips[element.object_uuid].reset(object);
        }
      } else if (element.type == "audio") {
        this.audio_engine.loadClip(element.media_id);
      } else if (element.type == "animation") {
        this.animation_engine.clips[element.object_uuid].stop();
      } else if (element.type == "lipsync") {
        this.lipSync_engine.clips[element.object_uuid].reset();
      } else {
        this.stop();
        throw "Error New Type of element in the timeline";
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
  public async update() {
    //if (this.is_playing == false) return; // start and stop

    if (this.is_playing) {
      this.current_time += 1;
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
        this.scrubber_frame_position <= element.length
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
          element.group !== ClipGroup.CHARACTER &&
          element.type === ClipType.AUDIO
        ) {
          if (this.scrubber_frame_position + 1 >= element.length) {
            this.audio_engine.stopClip(element.media_id);
          } else {
            this.audio_engine.playClip(element.media_id);
          }
        } else if (
          element.group === ClipGroup.CHARACTER &&
          element.type === ClipType.AUDIO
        ) {
          if (this.scrubber_frame_position + 1 >= element.length) {
            this.lipSync_engine.clips[element.object_uuid].stop();
          } else if (object) {
            await this.lipSync_engine.clips[element.object_uuid].play(object);
            this.lipSync_engine.clips[element.object_uuid].step();
          }
        } else if (element.type === ClipType.ANIMATION) {
          if (object) {
            await this.animation_engine.clips[object.uuid].play(object);
            this.animation_engine.clips[object.uuid].step(
              this.scrubber_frame_position / 120, // Double FPS for best result.
            );
          }
        } else {
          this.stop();
          throw "Error New Type of element in the timeline";
        }
        //this.timelineItems = this.timelineItems.filter(item => item !== element)
      }
    }

    if (
      this.scrubber_frame_position >= this.timeline_limit &&
      this.is_playing
    ) {
      await this.stop();
    }
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

// How much timeline precision we have
//const percision = 100 // using a fake update loop mock
//
//class AudioEngineMock {
//    async play(media_id:string) {
//        console.log("Audio Playing {media_id}")
//    }
//}
//
//// Visual verification tests.
//function CheckIfBasicAudioClipWorks() {
//    const timeline = new TimeLine()
//    timeline.addPlayableClip(new ClipUI(1.0,'audio',1,0))
//    timeline.play()
//}
//
//function CheckIfBasicTransformClipWorks() {
//    const timeline = new TimeLine()
//    timeline.addPlayableClip(new ClipUI(1.0,'transform',2,0))
//    timeline.play()
//}
//
//function CheckIfBasicClipWorks() {
//    const timeline = new TimeLine()
//    timeline.addPlayableClip(new ClipUI(1.0,'animation',3,0))
//    timeline.play()
//}

// function CheckIfBasicClipWorks3SecondsAfterTimelineStops() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip1", 0, 10000))
//     timeline.play()
// }

// function CheckIfTwoClipsAtTheSameTimeWorks() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip1", 0, 1000))
//     timeline.play()
// }

// function CheckIfTwoClipsOneAfterAnotherWorks() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip1", 0, 1000))
//     timeline.addPlayableClip(new ClipUI("clip2", 0, 2000))
//     timeline.play()
// }

// function CheckIfTimeLineStopBeforeClipPlays() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip3",0,1000))
//     timeline.play()
//     setInterval(async ()=> {
//         timeline.stop()
//     },1100)
//     console.log("Stopped")
// }

// function CheckIfTimeLineStartAfterClipPlays() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip3",0,1000))
//     timeline.play()
//     setInterval(async ()=> {
//         timeline.stop()
//     },500)
//     console.log("Stopped")
// }

// function CheckIfClipsPlayAllTogetherConcurrently() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new ClipUI("clip1",0,1000))
//     timeline.addPlayableClip(new ClipUI("clip2",0,1000))
//     timeline.addPlayableClip(new ClipUI("clip3",0,1000))
//     timeline.addPlayableClip(new ClipUI("clip4",0,1000))
//     timeline.play()
// }

// function CheckIfClipsPlayAllTogether() {
//     const timeline = new TimeLine()
//     timeline.addPlayableClip(new TrackClip("clip1",0,1000))
//     timeline.addPlayableClip(new TrackClip("clip2",0,1000))
//     timeline.addPlayableClip(new TrackClip("clip3",0,1000))
//     timeline.addPlayableClip(new TrackClip("clip4",0,1000))
//     timeline.play()
// }

//CheckIfBasicClipWorks()
//CheckIfTwoClipsAtTheSameTimeWorks()
// CheckIfTwoClipsOneAfterAnotherWorks()
// CheckIfTimeLineStopBeforeClipPlays()
// CheckIfTimeLineStartAfterClipPlays()
// CheckIfClipsPlayAllTogetherConcurrently()

// CheckIfClipsPlayAllTogether()
