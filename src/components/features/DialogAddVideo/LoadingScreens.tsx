import { LoadingSpinner } from "~/components/ui";
import { faCircleCheck } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DialogAddMediaStatuses } from "./enums";
import { Button } from "~/components/ui";

export const LoadingScreens = ({
  currStatus,
}: {
  currStatus: DialogAddMediaStatuses;
}) => {
  if (currStatus === DialogAddMediaStatuses.FILE_UPLOADING) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner isShowing={true} message="Uploading File..." />
      </div>
    );
  }
  if (currStatus === DialogAddMediaStatuses.FILE_RECORD_REQUESTING) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner isShowing={true} message="Processing File..." />
      </div>
    );
  }
  if (currStatus === DialogAddMediaStatuses.ERROR_FILE_UPLOAD) {
    return (
      <ErrorScreens
        title="Fail to Upload File"
        message="Your video maybe too long, the file maybe too big, or it maybe malformed. Please try again."
      />
    );
  }
  if (currStatus === DialogAddMediaStatuses.ERROR_FILE_RECORD_REQUEST) {
    return (
      <ErrorScreens
        title="Fail to Process File"
        message="Your video maybe too long, the file maybe too big, or it maybe malformed. Please try again."
      />
    );
  }
  if (currStatus === DialogAddMediaStatuses.FILE_RECORD_RECEIVED) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <FontAwesomeIcon
          icon={faCircleCheck}
          className="size-10 text-green-500"
        />
        <p>Upload and proccessing is successful!</p>
      </div>
    );
  }
  return null;
};

const ErrorScreens = ({
  title,
  message,
  retry,
}: {
  title: string;
  message: string;
  retry?: () => void;
}) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{message}</p>
      <Button onClick={retry}>Retry</Button>
    </div>
  );
};
