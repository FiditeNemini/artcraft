import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useState
} from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  faXmark,
  faGears,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Button } from '~/components/Button';
import { TOP_BAR_HEIGHT } from '~/constants';

interface SidePanelPropsI{
  title?: string;
  children: React.ReactNode;
}

export const SidePanel =({
  title,
  children,
}:SidePanelPropsI)=>{
  const [height, setHeight] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = ()=> setOpen(true);

  const handleWindowResize = useCallback(()=>{
    setHeight((window.innerHeight * 3 / 4) - TOP_BAR_HEIGHT);
  },[])

  useLayoutEffect(()=>{
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize])

  return (<>
    <Button 
      className='fixed right-0 top-20 mt-2 mr-4'
      onClick={handleOpen}
    >
      <FontAwesomeIcon className="fa-2xl -mx-2" icon={faGears} />
    </Button>
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none inset-y-0 fixed top-16 mt-2 right-0 flex max-w-full pl-10 sm:pl-16">
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
                  <div
                    className="flex flex-col overflow-y-scroll bg-ui-panel py-6 shadow-xl border-y border-l border-ui-panel-border"
                    style={{height:height+'px'}}
                  >
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        {!title && <span/>}
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