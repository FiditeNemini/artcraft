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
  const inputRef = useRef<HTMLInputElement>(null);

  const fileChange = (inputFile?: any) => {
    onChange(inputFile);
    fileSet(inputFile || null);
    blobSet(inputFile ? URL.createObjectURL(inputFile) : "");
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
    }
  };
};