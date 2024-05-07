import { Button } from "~/components";

interface Props {
  onCancel: () => void;
  onRetry: () => void;
}

export const UploadLoaderError = ({ onCancel, onRetry }: Props) => {
  return (
    <>
      There was a problem loading your object. Try another.
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
