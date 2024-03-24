export interface AnimationTrackClip {
  version: number
  media_id: string
  object_uuid: string
  type: "animation"
  location: "glb" | "remote"
  speed: number
  length: number
  clip_name: string
}

export class AnimationTrackClip implements AnimationTrackClip {
  version: number
  media_id: string // comes from the server
  object_uuid: string
  type: "animation"
  location: "glb" | "remote"
  speed: number
  length: number
  clip_name: string

  constructor(
    version: number,
    media_id: string,
    location: "glb" | "remote",
    object_uuid: string,
    speed: number,
    length: number,
    clip_name: string,
  ) {
    this.version = version
    this.media_id = media_id
    this.type = "animation"
    this.object_uuid = object_uuid
    this.location = location
    this.speed = speed
    this.length = length
    this.clip_name = clip_name
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      media_id: this.media_id,
      object_uuid: this.object_uuid,
      type: this.type,
      speed: this.speed,
      length: this.length,
      clip_name: this.clip_name,
    })
  }
}
