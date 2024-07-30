import React from "react";
import { a, easings, useTransition } from "@react-spring/web";
import "./ModalLayer.scss";

interface Props {
  content?: React.ElementType | null;
  contentProps?: any;
  close: () => void;
  killModal: boolean;
  lockTint?: boolean;
  modalOpen: boolean;
  onModalCloseEnd: (x: any) => void;
}

export default function ModalLayer({
  content: Content,
  contentProps,
  close,
  lockTint,
  modalOpen,
  onModalCloseEnd,
}: Props) {
  const mainClassName = "fy-modal-layer";
  const tintTransition = useTransition(modalOpen, {
    config: {
      easing: modalOpen ? easings.easeOutQuad : easings.easeInQuad,
      duration: 100,
    },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    onRest: onModalCloseEnd,
  });

  return tintTransition(
    (tintStyle, modalIsOpen) =>
      modalIsOpen && (
        <a.div
          {...{
            className: mainClassName,
            style: tintStyle,
            onClick: ({ target }) => {
              if (
                !lockTint &&
                target instanceof HTMLElement &&
                target.className === mainClassName
              ) {
                close();
              }
            },
          }}
        >
          <div {...{ className: "fy-modal-body" }}>
            {Content && (
              <Content {...{ ...contentProps, handleClose: close }} />
            )}
          </div>
        </a.div>
      )
  );
}
