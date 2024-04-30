import React, { useId, useRef, useState } from "react";
import { UploadModal } from "~/components";
// import { useId } from 'hooks'; // replace with react v18
import "./FileWrapper.scss";

interface Props {
  render?: JSX.Element | JSX.Element[];
  fileTypes?: string[];
  onChange: (file?: React.ChangeEvent) => void;
  onSuccess: () => void;
  panelClass?: string;
}

export default function FileWrapper({
  render: Render,
  fileTypes = [],
  onSuccess,
  ...rest
}: Props) {
  const fileRef = useRef(null);
  const [file, fileSet] = useState<File | undefined>();
  const [modalOpen, modalOpenSet] = useState(false);
  const [resetModal, resetModalSet] = useState(false);
  const [dragging, draggingSet] = useState(false);
  const id = "file-input-" + useId();
  const accept = fileTypes.map((type) => `.${type.toLowerCase()}`).join(",");
  const clearFile = () => {
    if (fileRef.current !== null) {
      fileRef.current.value = "";
      fileSet(undefined);
    }
  };
  const closeModal = () => modalOpenSet(false);

  const fileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetModalSet(true);
    e.preventDefault();
    fileSet(e.target.files[0]);
    modalOpenSet(true);
  };
  const onDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDragEvent =
    (onOff: boolean) =>
    (e: React.DragEvent<HTMLDivElement>): void => {
      draggingSet(onOff);
      onDragDrop(e);
    };
  const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    draggingSet(false);
    onDragDrop(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileSet(e.dataTransfer.files[0]);
      modalOpenSet(true);
      // onChange({ target: { name: e.target?.name || "file-input", value: e.dataTransfer.files[0] }});
    }
  };

  return (
    <div
      {...{
        className: `fy-file-wrapper${dragging ? " fy-file-dragging" : ""}`,
        onDragLeave: onDragEvent(false),
        onDragOver: onDragEvent(true),
        onDrop,
      }}>
      <input
        {...{
          accept,
          className: "fy-file-wrapper-input",
          onChange: fileChange,
          type: "file",
          id,
          ref: fileRef,
          ...rest,
        }}
      />
      <Render {...{ parentId: id }} />
      <UploadModal
        {...{
          closeModal,
          file,
          isOpen: modalOpen,
          onClose: clearFile,
          onSuccess,
          resetModal,
          resetModalSet,
        }}
      />
    </div>
  );
}
