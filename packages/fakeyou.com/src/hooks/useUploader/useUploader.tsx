import { useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import { UploadAudio, UploadAudioIsOk, UploadAudioRequest } from "@storyteller/components/src/api/upload/UploadAudio";

const n = (o: any) => o;

interface Props {
  debug?: boolean;
  formClearedSet?: (cleared: boolean) => void;
}

export default function useUploader({ debug, formClearedSet = n }: Props) {
  const [file, fileSet] = useState<any>(undefined);
  const [blob, blobSet] = useState<string>();
  const [uploading, uploadingSet] = useState(false);
  const [uploadDisabled, uploadDisabledSet] = useState<boolean>(false);
  const [mediaUploadToken, mediaUploadTokenSet] = useState<string | undefined>(undefined);
  const [convertIdempotencyToken, convertIdempotencyTokenSet] = useState(uuidv4());
  const [canConvert, canConvertSet] = useState(false);
  const [iToken, iTokenSet] = useState(uuidv4());  // Auto generated
  const resetIToken = () => iTokenSet(uuidv4());

  const handleUploadFile = async () => {
    if (file === undefined) { return false; }

    uploadingSet(true);

    const request: UploadAudioRequest = {
       uuid_idempotency_token: iToken,
       file: file,
       source: "file",
    };

    let result = await UploadAudio(request);

    if (UploadAudioIsOk(result)) {
       uploadDisabledSet(true);
       mediaUploadTokenSet(result.upload_token);
       formClearedSet(false);
       canConvertSet(true);
    }

    uploadingSet(false);
  };
  const inputChange = (inputFile?: any) => {
    console.log("🍡",inputFile);
    convertIdempotencyTokenSet(uuidv4());
    fileSet(inputFile || null);
    blobSet(inputFile ? URL.createObjectURL(inputFile) : "");
    canConvertSet(false);
    resetIToken();
    uploadDisabledSet(false);
    formClearedSet(!inputFile);
  };
  const onChange = ({ target = {} }: { target: any }) => {
    inputChange(target.value);
  };
  const onClear = () => {
    inputChange();
    mediaUploadTokenSet(undefined);
  };

   return { blob, canConvert, convertIdempotencyToken, file, fileSet, handleUploadFile, idempotency: { token: iToken, set: iTokenSet}, mediaUploadToken, mediaUploadTokenSet, onChange, onClear, resetIToken, uploading, uploadDisabled, uploadingSet };
};