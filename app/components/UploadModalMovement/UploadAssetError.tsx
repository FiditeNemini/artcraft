import { Button } from "~/components";

interface Props {
  onCancel: () => void;
  onRetry: () => void;
  isAssetError: boolean;
}

export const UploadAssetError = ({
  onCancel,
  onRetry,
  isAssetError,
}: Props) => {
  return (
    <>
      {isAssetError
        ? "There was a problem uploading your object."
        : "There was a problem creating art for your object"}
      <div className="mt-6 flex justify-end gap-2">
        <Button
          {...{
            onClick: onCancel,
            variant: "secondary",
          }}>
          Cancel
        </Button>
        <Button
          {...{
            onClick: onRetry,
            variant: "primary",
          }}>
          Try again
        </Button>
      </div>
    </>
  );
};
