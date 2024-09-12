import { useCallback } from "react";

import { dialogueError } from "~/signals/uiAccess/dialogueError";

import { DialogError } from "~/components/features";

export const SignaledDialogError = () => {
  const props = dialogueError.signal.value;
  const { isShowing, title, message } = props;
  const onClose = useCallback(() => {
    dialogueError.hide();
  }, []);
  return (
    <DialogError
      isShowing={isShowing}
      title={title}
      message={message}
      onClose={onClose}
    />
  );
};
