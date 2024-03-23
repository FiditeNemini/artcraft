export interface AnimationTrackClip {
  version: number
  media_id: number
  type: "animation"
  location: "glb" | "remote"
  speed: number
  length: number
  clip_name: string
}

export class AnimationTrackClip implements AnimationTrackClip {
  version: number
  media_id: number // comes from the server
  type: "animation"
  location: "glb" | "remote"
  speed: number
  length: number
  clip_name: string

  constructor(
    version: number,
    media_id: number,
    location: "glb" | "remote",
    speed: number,
    length: number,
    clip_name: string,
  ) {
    this.version = version
    this.media_id = media_id
    this.type = "animation"
    this.location = location
    this.speed = speed
    this.length = length
    this.clip_name = clip_name
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      media_id: this.media_id,
      type: this.type,
      speed: this.speed,
      length: this.length,
      clip_name: this.clip_name,
    })
  }
}
