import React from "react";
import { EntityInput } from "components/entities";
import ModalHeader from "components/modals/ModalHeader";
import { useModal } from "hooks";

interface MotionEntityInputProps {
  onChange: ({ target }: { target: any }) => void;
}

export default function MotionEntityInput({
  onChange,
}: MotionEntityInputProps) {
  const { close } = useModal();

  return (
    <div>
      <ModalHeader
        title="Upload Motion Reference Video"
        handleClose={close}
        titleClassName="fw-semibold fs-5"
      />
      <EntityInput
        accept={["video"]}
        className="w-100"
        onChange={onChange}
        type="media"
        showWebcam={false}
        showMediaBrowserFilters={false}
      />
    </div>
  );
}
