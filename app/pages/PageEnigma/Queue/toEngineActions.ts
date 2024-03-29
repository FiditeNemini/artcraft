export enum toEngineActions {
  ADD_CLIP = "add_clip",
  // data=QueueClip
  DELETE_CLIP = "delete_clip",
  // data=QueueClip
  MUTE = "mute",
  // data={version, type, group, object_uuid} if lipsync
  // data={version, type, group} if global_audio
  PLAY_CLIP = "play_clip",
  // data=QueueClip
  UNMUTE = "unmute",
  // data={version, type, group, object_uuid} if lipsync
  // data={version, type, group} if global_audio
  UPDATE_CLIP = "update_clip",
  // data=QueueClip
  UPDATE_TIME = "update_time",
  // data={currentTime: number}
}
