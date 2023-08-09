import React from "react";
import { useId } from 'hooks'; // replace with react v18
import './Uploader.scss'

interface Props {
  children?: JSX.Element|JSX.Element[];
  containerClass?: string;
  inputRef: any;
  onChange: (file?: any) => void;
  panelClass?: string;
};

export default function Uploader({ children, containerClass, inputRef, onChange, panelClass, }: Props) {
  const id = 'uploader-' + useId();

  const fileChange = (e: any) => {
    console.log("🧑🏻‍🎤",e.target.files);
     e.preventDefault();
    onChange({ target: { name: 'uploader', value: e.target.files[0] }});
  };

  const onDragDrop = (e: any) => { e.preventDefault(); e.stopPropagation(); };

  const onDragEvent = (onOff: number) => (e: React.DragEvent<HTMLDivElement>): void => {
    onDragDrop(e);
    e.currentTarget.classList[onOff ? "add" : "remove" ]("upload-zone-drag");
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>): void =>  {
    onDragDrop(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange({ target: { name: 'uploader', value: e.dataTransfer.files[0] }});
    }
  };

  return <div {...{ className: `fy-uploader${ containerClass ? " " + containerClass : "" }`, onDragLeave: onDragEvent(1), onDragOver: onDragEvent(0), onDrop }}>
    <input { ...{ name: "file", onChange: fileChange, type: "file", id, onClick: e => console.log('👨🏿‍🚒',e.target), ref: inputRef }} />
    <label {...{ className: `panel panel-inner d-flex align-items-center${ panelClass ? " " + panelClass : "" }`, htmlFor: id }} >
      { children }
    </label>
  </div>;
};
