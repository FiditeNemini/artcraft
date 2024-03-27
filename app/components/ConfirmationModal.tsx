import { Dialog } from "@headlessui/react";

interface Props {
  text: string;
  title: string;
  open: boolean;
  onClose: () => void;
  onOk?: () => void;
  okText?: string;
  okColor?: string;
  onCancel?: () => void;
  cancelText?: string;
}

export const ConfirmationModal = ({
  text,
  title,
  open,
  onClose,
  onOk,
  okText = "OK",
  okColor = "bg-brand-success",
  onCancel,
  cancelText = "Cancel",
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-white p-4 opacity-35" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="bg-black p-4">
          <Dialog.Title>{title}</Dialog.Title>

          <p className="my-6">{text}</p>

          <div className="flex justify-end gap-4">
            {!!onCancel && (
              <button onClick={onCancel} className="rounded-lg px-3 py-2">
                {cancelText}
              </button>
            )}
            {!!onOk && (
              <button
                onClick={onOk}
                className={[okColor, "rounded-lg px-3 py-2"].join(" ")}
              >
                {okText}
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
