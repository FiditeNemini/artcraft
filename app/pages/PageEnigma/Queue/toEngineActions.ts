export enum toEngineActions {
  ADD_CLIP = "add_clip",
  // data=QueueClip
  ADD_KEYFRAME = "add_keyframe",

  ADD_CHARACTER = "add_character",

  ADD_OBJECT = "add_object",

  // data= QueueKeyframe
  DELETE_CLIP = "delete_clip",
  // data=QueueClip
  DELETE_KEYFRAME = "delete_keyframe",
  // data=QueueKeyframe
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
  UPDATE_KEYFRAME = "update_keyframe",
  // data=QueueKeyframe
  UPDATE_TIME = "update_time",
  // data={currentTime: number}
}
