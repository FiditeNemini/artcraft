
export enum states{
  NO_FILE,
  FILE_STAGED,
  FILE_UPLOADING,
  FILE_UPLOADED,
  FILE_LOADED,
  // MOCAPNET_ENQUEUEING,
  // MOCAPNET_ENQUEUED,
}

export type State = {
  status: number;
  mediaFileToken?: string;
  inferenceJobToken?: string;
}

export type Action = 
  | {type: 'uploadFile'}
  | {type: 'stagedFile'}
  | {type: 'clearedFile'}
  | {type: 'uploadFileSuccess', payload:{ mediaFileToken: string}}
  // | {type: 'enqueueMocapNet'}
  // | {type: 'enqueueMocapNetSuccess', payload: {inferenceJobToken: string|undefined}}

export function reducer (state: State, action: Action): State {
  console.log(action);
  switch(action.type){
    case 'stagedFile':
      return {...state, status: states.FILE_STAGED}
    case 'clearedFile':
      return {...state, status: states.NO_FILE}
    case 'uploadFile':
      return {...state,status: states.FILE_UPLOADING};
    case 'uploadFileSuccess':
      return {
        ...state,
        status: states.FILE_UPLOADED,
        mediaFileToken: action.payload.mediaFileToken
      }
    // case 'enqueueMocapNet':
    //   return {...state, status:states.MOCAPNET_ENQUEUEING}
    // case 'enqueueMocapNetSuccess':
    //   return {
    //     ...state,
    //     status: states.MOCAPNET_ENQUEUED,
    //     inferenceJobToken: action.payload.inferenceJobToken
    //   };
    default:
      return {status: states.NO_FILE};
      
  }
}