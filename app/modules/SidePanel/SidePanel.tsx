import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  faXmark,
  faGears,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Button } from '~/components/Button';

interface SidePanelPropsI{
  title?: string;
  children: React.ReactNode;
}

export const SidePanel =({
  title,
  children,
}:SidePanelPropsI)=>{
  const [open, setOpen] = useState(false)
  const handleOpen = ()=>{
    setOpen(true);
  }

  return (<>
    <Button 
      className='fixed right-0 top-20 mt-2 mr-4'
      onClick={handleOpen}
    >
      <FontAwesomeIcon className="h-6 w-6" icon={faGears} />
    </Button>
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-ui-panel py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        {title &&
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            {title}
                          </Dialog.Title>
                        }
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md bg-brand-primary text-white hover:bg-brand-primary-400 focus:outline-none focus:ring-brand-primary-500"
                            onClick={() => setOpen(false)}
                          >
                            {/* <span className="absolute -inset-2.5" /> */}
                            <span className="sr-only">Close panel</span>
                            <FontAwesomeIcon
                              className="h-6 w-6 mt-1 mx-1"
                              aria-hidden="true"
                              icon={faXmark}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  </>);
}