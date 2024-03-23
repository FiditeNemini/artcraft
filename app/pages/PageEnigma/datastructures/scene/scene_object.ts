import { AudioTrackClip } from "../clips/audio_track_clip";
import { AnimationTrackClip } from "../clips/animation_track_clip";
import { TransformTrackClip } from "../clips/transform_track_clip";
import { ClipOffset } from "../clips/clip_offset";

export interface Scene {
  version: number;
  glb_media_id: number; // Assuming a numerical ID, adjust as needed
  skybox_type: "cube" | "six_sided_cube" | "sphere";
  skybox_media_ids: { [key: string]: number };
  timeline: Timeline;
}

export interface Timeline {
  version: number;
  last_scrubber_position: number;
  audio_track_clips: AudioTrackClip[]; // Assuming defined elsewhere
  transform_track_clips: TransformTrackClip[]; // Placeholder, define as needed
  animation_track_clips: AnimationTrackClip[]; // Placeholder, define as needed
  entities: Entity[];
  globalAudio: GlobalAudio;
  camera: Camera;
}

export interface Entity {
  object_uuid: number;
  clip_offsets: ClipOffset[];
}

export interface GlobalAudio {
  clip_offsets: ClipOffset[];
}

export interface Camera {
  clip_offsets: ClipOffset[];
}

export class Scene implements Scene {
  version: number;
  glb_media_id: number;
  skybox_type: "cube" | "six_sided_cube" | "sphere";
  skybox_media_ids: { [key: string]: number };
  timeline: Timeline;

  constructor(
    version: number,
    glb_media_id: number,
    skybox_type: "cube" | "six_sided_cube" | "sphere",
    skybox_image_ids: { [key: string]: number },
    timeline: Timeline,
  ) 
  {
    this.version = version;
    this.glb_media_id = glb_media_id;
    this.skybox_type = skybox_type;
    this.skybox_media_ids = skybox_image_ids;
    this.timeline = timeline;
  }

  toJSON(): string {
    return JSON.stringify(this);
  }
}

export class Timeline implements Timeline {
  version: number;
  last_scrubber_position: number;
  audio_track_clips: AudioTrackClip[];
  transform_track_clips: TransformTrackClip[];
  animation_track_clips: AnimationTrackClip[];
  entities: Entity[];
  globalAudio: GlobalAudio;
  camera: Camera;

  constructor(
    version: number,
    last_scrubber_position: number,
    audio_track_clips: AudioTrackClip[],
    transform_track_clips: TransformTrackClip[],
    animation_track_clips: AnimationTrackClip[],
    entities: Entity[],
    globalAudio: GlobalAudio,
    camera: Camera,
  ) 
  {
    this.version = version;
    this.last_scrubber_position = last_scrubber_position;
    this.audio_track_clips = audio_track_clips;
    this.transform_track_clips = transform_track_clips;
    this.animation_track_clips = animation_track_clips;
    this.entities = entities;
    this.globalAudio = globalAudio;
    this.camera = camera;
  }

  toJSON(): string {
    return JSON.stringify(this);
  }
}
