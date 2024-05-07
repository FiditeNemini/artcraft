import { Button } from "~/components";

interface Props {
  title: string;
  onOk: () => void;
}

export const UploadSuccess = ({ title, onOk }: Props) => {
  return (
    <div {...{ className: "obj-uploader-modal-success-view" }}>
      <div
        {...{
          className: "uploader-message",
        }}>{`Added ${title} to objects`}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          {...{
            onClick: onOk,
            variant: "primary",
          }}>
          Ok
        </Button>
      </div>
    </div>
  );
};
