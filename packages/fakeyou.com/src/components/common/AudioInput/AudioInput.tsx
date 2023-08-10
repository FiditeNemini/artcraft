import React from "react";
import { InputVcAudioPlayer } from "v2/view/_common/InputVcAudioPlayer";
import { FileActions, FileDetails, FileLabel, FileWrapper } from 'components/common';
import { faFileAudio } from "@fortawesome/pro-solid-svg-icons";
import './AudioInput.scss'

const fileTypes = ["MP3", "WAV", "FLAC", "OGG"];

interface Props {
  blob?: string;
  clear?: (file?: any) => void;
  file?: any;
  hideActions?: boolean;
  hideClearDetails?: boolean;
  inputProps?: any;
  success?: boolean;
  submit?: () => void;
  working?: boolean;
  [x:string]: any;
}

const n = () => {};

export default function AudioInput({ blob = "", clear = n, file, hideActions, hideClearDetails, inputProps, success = false, submit = n, working = false, ...rest }: Props) {

  return <div {...{ className: "fy-audio-uploader" }}>
    <FileWrapper {...{ fileTypes, ...inputProps, panelClass: "p-3", ...rest }}>
     { file ? <FileDetails {...{ clear, hideClearDetails, icon: faFileAudio, file }}/> : <FileLabel {...{ fileTypes }}/> }
    </FileWrapper>
      { file && <>
        <div {...{ className: "panel panel-inner rounded p-3" }}>
          <InputVcAudioPlayer {...{ filename: blob as string }}/>
        </div>
        { !hideActions && <FileActions {...{ clear, success, submit, working }}/> }
      </> }
  </div>;
};