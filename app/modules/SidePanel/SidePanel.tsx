import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { faGears } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "~/components/Button";

import { SidePanelInner } from "./SidePanelInner";

interface SidePanelPropsI {
  title?: string;
  children: React.ReactNode;
}

export const SidePanel = ({ title, children }: SidePanelPropsI) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button className="fixed right-0 top-20 mr-4 mt-2" onClick={handleOpen}>
        <FontAwesomeIcon className="fa-2xl -mx-2" icon={faGears} />
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <div className="fixed inset-0" />

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 top-16 mt-2 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen lg:max-w-md">
                    <SidePanelInner title={title} closeCallback={handleClose}>
                      {children}
                    </SidePanelInner>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
