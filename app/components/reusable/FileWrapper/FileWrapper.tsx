import React, { ReactNode, useId, useRef, useState } from "react";
import { AssetType } from "~/enums";
import { UploadModal } from "~/components";
import { twMerge } from "tailwind-merge";

interface Props {
  render: (parentId: string) => ReactNode;
  fileTypes?: string[];
  onChange?: (file?: React.ChangeEvent) => void;
  onSuccess: () => void;
  panelClass?: string;
  type: AssetType;
}

export function FileWrapper({
  render,
  fileTypes = [],
  onSuccess,
  type,
  ...rest
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [dragging, setDragging] = useState(false);
  const id = "file-input-" + useId();
  const accept = fileTypes
    .map((fileType) => `.${fileType.toLowerCase()}`)
    .join(",");

  const clearFile = () => {
    if (fileRef.current !== null) {
      fileRef.current.value = "";
      setFile(undefined);
    }
  };
  const closeModal = () => setModalOpen(false);

  const fileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResetModal(true);
    event.preventDefault();
    setFile(event.target?.files?.[0]);
    setModalOpen(true);
  };
  const onDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDragEvent =
    (onOff: boolean) =>
    (event: React.DragEvent<HTMLDivElement>): void => {
      setDragging(onOff);
      onDragDrop(event);
    };
  const onDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    setDragging(false);
    onDragDrop(event);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
      setModalOpen(true);
    }
  };

  return (
    <div
      className={twMerge(
        "flex h-full flex-col gap-3.5 overflow-y-auto",
        dragging ? "border-white/33 border bg-ui-controls-button" : "",
      )}
      onDragLeave={onDragEvent(false)}
      onDragOver={onDragEvent(true)}
      onDrop={onDrop}
    >
      <input
        accept={accept}
        className="absolute hidden h-0 w-0"
        onChange={fileChange}
        type="file"
        id={id}
        ref={fileRef}
        {...rest}
      />
      {render(id)}
      <UploadModal
        closeModal={closeModal}
        file={file!}
        isOpen={modalOpen}
        onClose={clearFile}
        onSuccess={onSuccess}
        resetModal={resetModal}
        setResetModal={setResetModal}
        type={type}
      />
    </div>
  );
}
