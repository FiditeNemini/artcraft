export const apiHost = "https://api.storyteller.ai";

// Authentications
// const createAccount = `${apiHost}}/create_account`;
// export const login = `${apiHost}/v1/login`;
// export const getSession = `${apiHost}/v1/session`;
// export const logout = `${apiHost}/v1/logout`;

// Inference Jobs
// export const getRecentJobs = `${apiHost}/v1/jobs/session`;
// export const getActiveJobs = `${apiHost}/v1/jobs/session?exclude_states=complete_success,complete_failure,dead,cancelled_by_user,cancelled_by_system`;
// export const getJobStatus = (jobToken: string) =>
// `${apiHost}/v1/model_inference/job_status/${jobToken}`;

// TTS
// export const inferTts = `${apiHost}/tts/inference`;
// export const listTts = `${apiHost}/tts/list`;

//V2V
// export const listV2V = `${apiHost}/v1/voice_conversion/model_list`;
// export const inferV2V = `${apiHost}/v1/voice_conversion/inference`;
export const uploadAudioV2V = `${apiHost}/v1/media_uploads/upload_audio`;

// User Media
// export const listMediaByUser = (username: string) =>
//   `${apiHost}/v1/media_files/list/user/${username}`;

// Get Any Media
// export const getMediaFileByToken = (fileToken: string) =>
//   `${apiHost}/v1/media_files/file/${fileToken}`;

// Upload File
export const uploadMedia = `${apiHost}/v1/media_files/upload`;

// Scenes
export const uploadNewScene = `${apiHost}/v1/media_files/upload/new_scene`;
export const uploadThumbnail = `${apiHost}/v1/media_files/cover_image/`;
export const updateExistingScene = (sceneToken: string) =>
  `${apiHost}/v1/media_files/upload/saved_scene/${sceneToken}`;
// export const renameScene = (sceneToken: string) =>
//   `${apiHost}/v1/media_files/rename/${sceneToken}`;
