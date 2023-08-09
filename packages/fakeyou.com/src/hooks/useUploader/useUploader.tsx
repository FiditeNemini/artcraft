import { useRef, useState } from 'react';

const n = (o: any) => o;

interface Props {
  debug?: any;
  formClearedSet?: (cleared: boolean) => void;
  onChange?: (file: any) => void;
  onClear?: (x?: any) => void;
  onUpload?: (file: any) => boolean;
}

export default function useUploader({ debug, onChange = n, onClear = n, onUpload = n }: Props) {
  const [file, fileSet] = useState<any>(undefined);
  const [blob, blobSet] = useState<string>();
  const [working, workingSet] = useState(false);
  const [successful, successfulSet] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (file === undefined) { return false; }
    const onUploadResult = await onUpload(file);
    workingSet(true);
    if (onUploadResult) { successfulSet(true); }
    successfulSet(false);
  };
  const fileChange = (inputFile?: any) => {
    onChange(file);
    fileSet(inputFile || null);
    blobSet(inputFile ? URL.createObjectURL(inputFile) : "");
    successfulSet(false);
  };
  const inputChange = ({ target = {} }: { target: any }) => {
    fileChange(target.value);
  };
  const clear = () => {
    if (inputRef?.current?.value) inputRef.current.value = '';
    fileChange();
    onClear();
  };

  return { 
    blob,
    clear,
    file,
    fileSet,
    inputProps: {
      onChange: inputChange,
      inputRef
    },
    submit,
    successful,
    working,
  };
};