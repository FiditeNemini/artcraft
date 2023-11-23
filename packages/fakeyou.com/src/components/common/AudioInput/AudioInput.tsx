import React from "react";
// import { a, useTransition } from '@react-spring/web';
// import { InputVcAudioPlayer } from "v2/view/_common/InputVcAudioPlayer";
import { FileDetails, FileLabel, FileWrapper } from 'components/common';
import { faFileAudio } from "@fortawesome/pro-solid-svg-icons";
import './AudioInput.scss'

const fileTypes = ["MP3", "WAV", "FLAC", "OGG"];

interface Props {
  blob?: string;
  children?: any;
  clear?: (file?: any) => void;
  file?: any;
  hideDetails?: boolean;
  hideClearDetails?: boolean;
  inputProps?: any;
  [x:string]: any;
}

const n = () => {};

export default function AudioInput({ children, clear = n, file, hideDetails, hideClearDetails, inputProps, ...rest }: Props) {

  // const transitions = useTransition(file, {
  //   config: { tension: 120,  friction: 15 },
  //   from: { opacity: 0 },
  //   enter: { opacity: 1 },
  //   leave: { opacity: 0 },
  //   onRest,
  // });

  return <div {...{ className: "fy-audio-uploader" }}>
    <FileWrapper {...{ fileTypes, ...inputProps, panelClass: "p-3", ...rest }}>
     { file ? <FileDetails {...{ clear, hideClearDetails, icon: faFileAudio, file }}/> : <FileLabel {...{ fileTypes }}/> }
    </FileWrapper>
      { children
      //   transitions((style, i) => i ? <a.div {...{ className: "audio-details", style }}>
      //   <div {...{ className: "panel panel-inner rounded p-3" }}>
      //     <InputVcAudioPlayer {...{ filename: blob as string }}/>
      //   </div>
      //   { !hideActions && <FileActions {...{ clear, success, submit, working }}/> }
      // </a.div> : null )
      }
  </div>;
};