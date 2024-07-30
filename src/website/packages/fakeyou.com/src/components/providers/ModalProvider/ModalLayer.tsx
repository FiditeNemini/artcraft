import React from "react";
import { a, easings, useTransition } from "@react-spring/web";
import "./ModalLayer.scss";

interface Props {
  content?: React.ElementType | null;
  contentProps?: any;
  handleClose: () => void;
  killModal: boolean;
  modalOpen: boolean;
  onModalCloseEnd: (x: any) => void;
}

export default function ModalLayer({
  content: Content,
  contentProps,
  handleClose,
  modalOpen,
  onModalCloseEnd,
}: Props) {
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
    (tinter, shade) =>
      shade && (
        <a.div {...{ className: "fy-modal-layer", style: { ...tinter } }}>
          <div {...{ className: "fy-modal-body" }}>
            {Content && <Content {...{ ...contentProps, handleClose }} />}
          </div>
        </a.div>
      )
  );
}
