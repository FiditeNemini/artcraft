import { Dialog, Transition } from "@headlessui/react";
import { Button } from "~/components/Button";
import { Fragment } from "react";

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
    <Transition appear show={open} as={Fragment}>
      <Dialog open={open} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl border border-ui-panel-border bg-ui-panel p-5 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h4"
                className="mb-4 text-xl font-bold text-white"
              >
                {title}
              </Dialog.Title>

              <div className="mt-2">{text}</div>

              <div className="mt-6 flex justify-end gap-2">
                {!!onCancel && (
                  <Button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg px-3 py-2"
                    variant="secondary"
                  >
                    {cancelText}
                  </Button>
                )}
                {!!onOk && (
                  <Button
                    type="button"
                    onClick={onOk}
                    className={[okColor, "rounded-lg px-3 py-2"].join(" ")}
                  >
                    {okText}
                  </Button>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
