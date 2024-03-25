import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

import { Button, ButtonPropsI } from '~/components/Button';


type UnionedButtonProps =  {label?:string } & ButtonPropsI;

interface ButtonDialoguePropsI  {
  buttonProps?: UnionedButtonProps;
  confirmButtonProps?: UnionedButtonProps;
  closeButtonProps?: UnionedButtonProps;
  title?: string;
  children: React.ReactNode;
}

export const ButtonDialogue = ({
  buttonProps : unionedButtonProps,
  confirmButtonProps,
  closeButtonProps : unionedCloseButtonProps,
  title,
  children,
}: ButtonDialoguePropsI) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const {
    label: buttonLabel,
    ...buttonProps
  } = unionedButtonProps || {label:"Open"};
  const {
    label: closeButtonLabel,
    ...closeButtonProps
  } = unionedCloseButtonProps || {label:"Close"};
  return (
    <>
      <Button
        type="button"
        onClick={openModal}
        {...buttonProps}
      >
        {buttonLabel}
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {title && 
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                  }
                  <div className="mt-2">
                    {children}
                  </div>

                  <div className="mt-4 flex justify-between ">
                    {confirmButtonProps &&
                      <Button
                        type="button"
                        {...confirmButtonProps}
                        onClick={(e)=>{
                          if(confirmButtonProps.onClick){
                            confirmButtonProps.onClick(e);
                          }
                          closeModal();
                        }}
                        
                      >
                        {confirmButtonProps.label ? confirmButtonProps.label : "Confirm" }
                      </Button>
                    }
                    <span />
                    <Button
                      type="button"
                      onClick={closeModal}
                      {...closeButtonProps}
                    >
                      {closeButtonLabel}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

