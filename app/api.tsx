export const apiHost = 'https://api.fakeyou.com';

// Authentications
// const createAccount = `${apiHost}}/create_account`;
export const login = `${apiHost}/v1/login`;
export const getSession = `${apiHost}/v1/session`;
export const logout = `${apiHost}/v1/logout`;

// TTS
export const inferTts = `${apiHost}/tts/inference`;
export const listTts = `${apiHost}/tts/list`;

//V2V
export const listV2V = `${apiHost}/v1/voice_conversion/model_list`

// User Media
export const listMediaByUser = (username:string) => `${apiHost}/v1/media_files/list/user/${username}`;

// Any Media
export const getMediaFileByToken = (fileToken:string) => `${apiHost}/v1/media_files/file/${fileToken}`;