import { useRef, useState } from 'react';

const n = (o: any) => o;

interface Props {
  debug?: any;
  onChange?: (file: any) => void;
  onClear?: (x?: any) => void;
  onSubmit?: (file: any) => Promise<boolean | undefined> | Promise<void>;
}

export default function useFile({ debug, onChange = n, onClear = n, onSubmit = n }: Props) {
  const [file, fileSet] = useState<any>(undefined);
  const [blob, blobSet] = useState<string>();
  const [status, statusSet] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (file === undefined) { return false; }
    statusSet(1);
    const onUploadResult = await onSubmit(file);
    if (onUploadResult) { statusSet(2); }
    else { statusSet(3); }
  };
  const fileChange = (inputFile?: any) => {
    onChange(file);
    fileSet(inputFile || null);
    blobSet(inputFile ? URL.createObjectURL(inputFile) : "");
    statusSet(0);
  };
  const inputChange = ({ target = {} }: { target: any }) => {
    fileChange(target.value);
  };
  const clear = () => {
    if (inputRef?.current?.value) inputRef.current.value = '';
    fileChange();
    onClear();
    statusSet(0);
  };

  return { 
    blob,
    clear,
    file,
    inputProps: {
      onChange: inputChange,
      inputRef
    },
    status,
    submit,
    success: status === 2,
    working: status === 1,
  };
};