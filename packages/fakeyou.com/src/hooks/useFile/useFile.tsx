import { useRef, useState } from 'react';

const n = (o: any) => o;

interface Props {
  debug?: any;
  onChange?: (file: any) => void;
  onClear?: (x?: any) => void;
  onSubmit?: (file: any) => Promise<boolean>;
}

export default function useFile({ debug, onChange = n, onClear = n, onSubmit = n }: Props) {
  const [file, fileSet] = useState<any>(undefined);
  const [blob, blobSet] = useState<string>();
  const [working, workingSet] = useState(false);
  const [success, successSet] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (file === undefined) { return false; }
    const onUploadResult = await onSubmit(file);
    workingSet(true);
    if (onUploadResult) { successSet(true); }
    successSet(false);
  };
  const fileChange = (inputFile?: any) => {
    onChange(file);
    fileSet(inputFile || null);
    blobSet(inputFile ? URL.createObjectURL(inputFile) : "");
    successSet(false);
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
    inputProps: {
      onChange: inputChange,
      inputRef
    },
    submit,
    success,
    working,
  };
};