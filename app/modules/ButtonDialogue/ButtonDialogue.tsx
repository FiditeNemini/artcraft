import { useState } from "react";
import { TransitionDialogue } from "~/components/TransitionDialogue";
import { Button, ButtonPropsI } from "~/components/Button";

type UnionedButtonProps = { label?: string } & ButtonPropsI;

interface ButtonDialoguePropsI {
  buttonProps?: UnionedButtonProps;
  confirmButtonProps?: UnionedButtonProps;
  closeButtonProps?: UnionedButtonProps;
  dialogProps?:{
    className?: string;
  };
  title?: string;
  children: React.ReactNode;
}

export const ButtonDialogue = ({
  dialogProps = {},
  buttonProps: unionedButtonProps,
  confirmButtonProps,
  closeButtonProps: unionedCloseButtonProps,
  title,
  children,
}: ButtonDialoguePropsI) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const { label: buttonLabel, ...buttonProps } = unionedButtonProps || {
    label: "Open",
  };
  const { label: closeButtonLabel, ...closeButtonProps } =
    unionedCloseButtonProps || { label: "Close" };
  return (
    <>
      <Button type="button" onClick={openModal} {...buttonProps}>
        {buttonLabel}
      </Button>

      <TransitionDialogue
        title={title}
        isOpen={isOpen}
        onClose={closeModal}
        className={dialogProps.className}
      >
        <div className="mt-2">{children}</div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            onClick={closeModal}
            {...closeButtonProps}
            variant="secondary"
          >
            {closeButtonLabel}
          </Button>
          {confirmButtonProps && (
            <Button
              type="button"
              {...confirmButtonProps}
              onClick={(e) => {
                if (confirmButtonProps.onClick) {
                  confirmButtonProps.onClick(e);
                }
                closeModal();
              }}
            >
              {confirmButtonProps.label
                ? confirmButtonProps.label
                : "Confirm"}
            </Button>
          )}
        </div>
        </TransitionDialogue>
    </>
  );
};
