export const apiHost = 'https://api.fakeyou.com';

// Authentications
// const createAccount = `${apiHost}}/create_account`;
export const login = `${apiHost}/v1/login`;
export const getSession = `${apiHost}/v1/session`;
export const logout = `${apiHost}/v1/logout`;

// TTS
export const inferTts = `${apiHost}/tts/inference`;
export const listTts = `${apiHost}/tts/list`;