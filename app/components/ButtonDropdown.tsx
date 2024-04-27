import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  IconDefinition,
  faChevronDown,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonPropsI } from "./Button";
import { TransitionDialogue } from "~/components/TransitionDialogue";

type UnionedButtonProps = { label?: string } & ButtonPropsI;

interface ButtonDropdownProps {
  label: string;
  icon?: IconDefinition;
  options: Array<{
    label: string;
    description?: string;
    onClick?: () => void;
    disabled?: boolean;
    divider?: boolean;
    dialogProps?: {
      title: string;
      content: React.ReactNode;
      className?: string;
      confirmButtonProps?: UnionedButtonProps;
      closeButtonProps?: UnionedButtonProps;
      showClose?: boolean;
      onClose?: () => void;
    };
  }>;
}

export const ButtonDropdown = ({
  label,
  options,
  icon,
}: ButtonDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );

  const closeModal = () => {
    setIsOpen(false);
    options[selectedOptionIndex!].dialogProps?.onClose?.();
  };

  const handleOptionClick = (index: number) => {
    const option = options[index];
    if (option.onClick) {
      option.onClick();
    }
    if (option.dialogProps) {
      setSelectedOptionIndex(index);
      setIsOpen(true);
    }
  };

  const currentDialogProps =
    selectedOptionIndex !== null
      ? options[selectedOptionIndex].dialogProps
      : null;

  return (
    <div className="relative">
      <Menu as="div" className="inline-block text-left">
        <Menu.Button as="div">
          <Button icon={faChevronDown} iconFlip={true} variant="secondary">
            {icon ? <FontAwesomeIcon icon={icon} /> : null}
            {label}
          </Button>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95">
          <Menu.Items
            static
            className="absolute left-0 mt-1 w-max divide-y divide-gray-100 overflow-hidden rounded-lg bg-brand-secondary py-1.5 focus:outline-none">
            <div>
              {options.map((option, index) => (
                <Fragment key={index}>
                  {option.divider && (
                    <div className="my-1.5 border-t border-ui-divider" />
                  )}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        disabled={option.disabled}
                        className={`duration-50 bg-brand-secondary font-medium text-white transition-all ${
                          active ? "bg-ui-controls-button/60" : ""
                        } ${option.disabled ? "pointer-events-none opacity-40" : ""} group flex w-full items-center py-1.5 pl-7 pr-4 text-sm`.trim()}
                        onClick={() => handleOptionClick(index)}>
                        <div className="flex w-full">
                          <div className="grow text-start">{option.label}</div>
                          <div className="ml-10 font-normal text-white/75">
                            {option.description && option.description}
                          </div>
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                </Fragment>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {currentDialogProps && (
        <TransitionDialogue
          title={currentDialogProps.title}
          isOpen={isOpen}
          onClose={closeModal}
          className={currentDialogProps.className}>
          {currentDialogProps.content}

          <div className="mt-6 flex justify-end gap-2">
            {currentDialogProps.showClose !== false &&
              currentDialogProps.closeButtonProps && (
                <Button
                  variant="secondary"
                  {...currentDialogProps.closeButtonProps}
                  onClick={closeModal}>
                  {currentDialogProps.closeButtonProps.label}
                </Button>
              )}

            {currentDialogProps.confirmButtonProps && (
              <Button
                {...currentDialogProps.confirmButtonProps}
                onClick={(e) => {
                  if (currentDialogProps.confirmButtonProps?.onClick) {
                    currentDialogProps.confirmButtonProps?.onClick(e);
                  }
                  closeModal();
                }}>
                {currentDialogProps.confirmButtonProps.label || "Confirm"}
              </Button>
            )}
          </div>
        </TransitionDialogue>
      )}
    </div>
  );
};
