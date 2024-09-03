// import { FileUploader } from "../FileUploader";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export const UploadImage = ({
  isOpen,
  closeCallback,
}: {
  isOpen: boolean;
  closeCallback: () => void;
}) => {
  return (
    <Dialog open={isOpen} onClose={closeCallback} className="relative z-50">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
          <DialogTitle className="font-bold">Upload Image</DialogTitle>
          <Description>This is dialogue desctiption </Description>
          <p>this is just a p tag</p>
          <div className="flex gap-4">
            <button onClick={closeCallback}>Cancel</button>
            <button onClick={closeCallback}>Enter</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
