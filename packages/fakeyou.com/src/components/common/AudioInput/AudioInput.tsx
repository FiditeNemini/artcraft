import React from "react";
import { a, useSpring } from '@react-spring/web';
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
  onRest?: () => void;
  success?: boolean;
  submit?: () => void;
  working?: boolean;
  [x:string]: any;
}

const n = () => {};

export default function AudioInput({ blob = "", clear = n, file, hideActions, hideClearDetails, inputProps, onRest = n, success = false, submit = n, working = false, ...rest }: Props) {
  const style = useSpring({
    config: { mass: 1, tension: 120, friction: 14 },
    onRest,
    opacity: file ? 1 : 0
  });

  return <div {...{ className: "fy-audio-uploader" }}>
    <FileWrapper {...{ fileTypes, ...inputProps, panelClass: "p-3", ...rest }}>
     { file ? <FileDetails {...{ clear, hideClearDetails, icon: faFileAudio, file }}/> : <FileLabel {...{ fileTypes }}/> }
    </FileWrapper>
      { file && <>
        <a.div {...{ className: "panel panel-inner rounded p-3", style }}>
          <InputVcAudioPlayer {...{ filename: blob as string }}/>
        </a.div>
        { !hideActions && <FileActions {...{ clear, success, submit, working }}/> }
      </> }
  </div>;
};