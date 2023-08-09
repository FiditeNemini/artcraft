import React from "react";
import { InputVcAudioPlayer } from "v2/view/_common/InputVcAudioPlayer";
import { UploadActions, UploadDetails, Uploader, UploadLabel } from 'components/common';
import { faFileAudio } from "@fortawesome/pro-solid-svg-icons";
import './AudioUploader.scss'

const fileTypes = ["MP3", "WAV", "FLAC", "OGG"];

interface Props {
  blob?: string;
  clear?: (file?: any) => void;
  file?: any;
  inputProps?: any;
  success?: boolean;
  upload?: () => void;
  uploading?: boolean;
}

const n = () => {};

export default function AudioUploader({ blob = "", clear = n, file, inputProps, success = false, upload = n, uploading = false }: Props) {

  return <div {...{ className: "fy-audio-uploader" }}>
    <Uploader {...{ ...inputProps, panelClass: 'p-3' }}>
     { file ? <UploadDetails {...{ clear, icon: faFileAudio, file }}/> : <UploadLabel {...{ fileTypes }}/> }
    </Uploader>
      { file && <>
        <div {...{ className: "panel panel-inner rounded p-3" }}>
          <InputVcAudioPlayer {...{ filename: blob as string }}/>
        </div>
        <UploadActions {...{ clear, success, upload, uploading }}/>
      </> }
  </div>;
};