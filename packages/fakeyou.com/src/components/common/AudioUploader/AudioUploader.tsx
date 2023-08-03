import React from "react";
import { InputVcAudioPlayer } from "v2/view/_common/InputVcAudioPlayer";
import { UploadActions, UploadDetails, Uploader, UploadLabel } from 'components/common';
import './AudioUploader.scss'

const fileTypes = ["MP3", "WAV", "FLAC", "OGG"];

interface Props {
  blob?: string;
  disabled?: boolean;
  file?: any;
  handleUpload?: () => void;
  onChange?: (file?: any) => void;
  onClear?: (file?: any) => void;
  uploading?: boolean;
}

const n = () => {};

export default function AudioUploader({ blob = "", disabled = false, file, handleUpload = n, onChange = n, onClear = n, uploading = false }: Props) {

  const handleClear = () => { onClear(); };

  return <>
    <Uploader {...{ onChange, panelClass: 'p-3' }}>
      <UploadLabel {...{ file, fileTypes }}>
        <UploadDetails {...{ file }}/>
      </UploadLabel>
    </Uploader>
      { file && <>
        <div className="panel panel-inner rounded p-3">
          <InputVcAudioPlayer {...{ filename: blob as string }}/>
        </div>
        <UploadActions {...{ disabled, handleClear, handleUpload, uploading }}/>
      </> }
  </>;
};