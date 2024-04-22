import { useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import {
  disableHotkeyInput,
  enableHotkeyInput,
  DomLevels,
} from "~/pages/PageEnigma/store";

const DialogBackdrop = () => {
  useEffect(() => {
    disableHotkeyInput(DomLevels.DIALOGUE);
    return () => {
      enableHotkeyInput(DomLevels.DIALOGUE);
    };
  }, []);

  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0">
      <div className="fixed inset-0 bg-black/60" />
    </Transition.Child>
  );
};

export const TransitionDialogue = ({
  isOpen,
  title,
  onClose,
  className,
  children,
}: {
  isOpen: boolean;
  title?: ReactNode;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 " onClose={onClose}>
        <DialogBackdrop />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel
                className={twMerge(
                  "w-full max-w-lg transform rounded-xl border border-ui-panel-border bg-ui-panel p-5 text-left align-middle shadow-xl transition-all",
                  className,
                )}>
                {title && (
                  <Dialog.Title
                    as="h4"
                    className="mb-4 text-xl font-bold text-white">
                    {title}
                  </Dialog.Title>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
