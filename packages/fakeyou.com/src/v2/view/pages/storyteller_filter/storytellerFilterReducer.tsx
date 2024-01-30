import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";

export enum states{
  NO_FILE,
  FILE_STAGED,
  FILE_SELECTED,
  FILE_UPLOADING,
  FILE_UPLOADED,
  FILE_LOADING,
  FILE_LOADED,
}

export type State = {
  status: number;
  mediaFileToken?: string;
  mediaFile?: MediaFile;
  inferenceJobToken?: string;
}

export type Action = 
  | {type: 'stagedFile'}
  | {type: 'clearedFile'}
  | {type: 'selectedFile', payload: { mediaFileToken: string}}
  | {type: 'uploadFile'}
  | {type: 'uploadFileSuccess', payload:{ mediaFileToken: string}}
  | {type: 'loadFile'}
  | {type: 'loadFileSuccess', payload:{mediaFile: MediaFile}}


export function reducer (state: State, action: Action): State {
  console.log(action);
  switch(action.type){
    case 'stagedFile':
      return {...state, status: states.FILE_STAGED}
    case 'clearedFile':
      return {...state, status: states.NO_FILE}
    case 'selectedFile':
      return {
        ...state,
        status: states.FILE_SELECTED,
        mediaFileToken: action.payload.mediaFileToken
      } 
    case 'uploadFile':
      return {...state,status: states.FILE_UPLOADING};
    case 'uploadFileSuccess':
      return {
        ...state,
        status: states.FILE_UPLOADED,
        mediaFileToken: action.payload.mediaFileToken
      }
    case 'loadFile':
      return {...state, status: states.FILE_LOADING}
    case 'loadFileSuccess':
      console.log("LOAD FILE SUCCESS");
      return {
        ...state,
        status: states.FILE_LOADED,
        mediaFile: action.payload.mediaFile
      }
    default:
      return {status: states.NO_FILE};
      
  }
}