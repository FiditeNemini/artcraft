import { useCallback } from 'react';
import { v4 as uuidv4 } from "uuid";

import { AudioTabPages, V2VState } from "./types";
import {
  faChevronRight,
  faRightLeft,
  // faCircleDot,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { EnqueueVoiceConversionRequest, EnqueueVoiceConversionResponse } from './typesImported';
import { GenerateVoiceConversion } from './utilities';
import { H4, H6, Button } from "~/components";

import UploadComponent from "~/components/UploadComponent";

export const PageVoicetoVoice = ({
  changePage,
  sessionToken,
  v2vState,
  setV2VState,
}:{
  changePage: (newPage:AudioTabPages) => void;
  sessionToken: string;
  v2vState : V2VState;
  setV2VState : (newState:V2VState)=>void,
}) => {
  const requestV2V = useCallback((sessionToken: string)=>{
    const modelToken = v2vState.voice 
      ? v2vState.voice.token
      : undefined;
    if(modelToken && v2vState.inputFileToken){
      let request: EnqueueVoiceConversionRequest = {
        uuid_idempotency_token: uuidv4(),
        voice_conversion_model_token: modelToken,
        source_media_upload_token: v2vState.inputFileToken,
      };

      GenerateVoiceConversion(request, sessionToken).then(
        (res:EnqueueVoiceConversionResponse)=>{
          if (res && res.inference_job_token) {
            setV2VState({
              ...v2vState,
              inferenceTokens: [
                ...v2vState.inferenceTokens,
                res.inference_job_token
              ],
            });
            changePage(AudioTabPages.LIBRARY);
          }
        }
      );
    }
  }, [v2vState]);
  return (
    <>
      <H4 className="mb-1">Select a Voice</H4>
      <div
        className="p-3 bg-brand-secondary rounded-lg flex justify-between items-center gap-3 cursor-pointer"
        onClick={()=>changePage(AudioTabPages.SELECT_V2V_MODEL)}
      >
        <span className="bg-brand-secondary-600 rounded-lg w-12 h-12"/>
        <div className="grow">
          {!v2vState.voice && <H4>None Selected</H4>}
          {v2vState.voice && <>
            <H4>{v2vState.voice.title}</H4>
            <H6>by {v2vState.voice.creator.display_name}</H6>
          </>}
        </div>
        <FontAwesomeIcon icon={faChevronRight} size="2x"/>
      </div>

      <H4 className="mt-4 mb-2">Upload Audio</H4>
      <UploadComponent 
        sessionToken={sessionToken}
        file={v2vState.file}
        onFileStaged={(file:File)=>{
          setV2VState({...v2vState, file: file});
        }}
        onClear={()=>{
          setV2VState({...v2vState, file: undefined});
        }}
        onFileUploaded={(fileToken:string)=>{
          setV2VState({
            ...v2vState,
            inputFileToken: fileToken
          });
        }}
      />
      {/* <div className="my-4 flex w-full gap-4 justify-between items-center">
        <span className="bg-brand-secondary grow h-1"/>
        <H4>OR</H4>
        <span className="bg-brand-secondary grow h-1"/>
      </div> */}
      {/* <Button
        className="h-11 w-full text-sm"
        variant="secondary"
        icon={faCircleDot}
        onClick={() => {
          console.log("Record Button is clicked");
        }}>
        Record Audio
      </Button> */}
      <Button
        className="h-11 w-full text-sm mt-4"
        variant="primary"
        disabled={!v2vState.voice || !v2vState.inputFileToken}
        icon={faRightLeft}
        onClick={()=>requestV2V(sessionToken)}>
        Convert
      </Button>
    </>
  );
}