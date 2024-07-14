import React, { useEffect, useState } from "react";
import Button from "../Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSpring, a } from "@react-spring/web";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "./Modal.scss";

type HandleClose = () => void;

interface ModalProps {
  className?: string;
  content?: React.ElementType | null;
  contentProps?: any;
  show: boolean;
  handleClose: HandleClose;
  noHeader?: boolean;
  omitBody?: boolean;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => any;
  onConfirm?: (e: React.MouseEvent<HTMLElement>) => any;
  title?: string;
  icon?: IconDefinition;
  autoWidth?: boolean;
  showButtons?: boolean;
  padding?: boolean;
  large?: boolean;
  position?: "center" | "top";
  mobileFullscreen?: boolean;
}

export interface ModalUtilities {
  handleClose: HandleClose;
}

const ModalBody = ({
  children,
  omitBody,
  padding,
}: {
  children: any;
  omitBody?: boolean;
  padding?: boolean;
}) =>
  omitBody ? (
    children
  ) : (
    <div {...{ className: `modal-body ${padding ? "p-3" : ""}` }}>
      {children}
    </div>
  );

const Modal: React.FC<ModalProps> = ({
  autoWidth,
  className,
  content: Content,
  contentProps,
  handleClose,
  noHeader,
  omitBody,
  onCancel: cancelEvent,
  onConfirm: confirmEvent,
  icon,
  show,
  showButtons = true,
  title,
  padding = true,
  large = false,
  position = "center",
  mobileFullscreen = false,
}) => {
  const fadeIn = useSpring({
    opacity: show ? 1 : 0,
    config: { duration: 80, easing: t => t },
  });
  const [loaded, loadedSet] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent && !modalContent.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (!loaded) {
      loadedSet(true);
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, handleClose, loaded]);

  const onCancel = (e: React.MouseEvent<HTMLElement>) => {
    if (cancelEvent) cancelEvent(e);
    handleClose();
  };

  const onConfirm = (e: React.MouseEvent<HTMLElement>) => {
    if (confirmEvent) confirmEvent(e);
    handleClose();
  };

  const modalUtilities: ModalUtilities = { handleClose };

  if (!show) {
    return null;
  }

  return (
    <a.div style={fadeIn} className="modal-backdrop">
      <div
        {...{
          className: `modal${className ? " " + className : ""}`,
          role: "dialog",
        }}
      >
        <div
          className={`modal-dialog ${
            position === "center" ? "modal-dialog-centered" : ""
          } ${large ? "modal-xl" : ""} ${autoWidth ? "modal-width-auto" : ""} ${
            mobileFullscreen ? "modal-dialog-mobile-fullscreen" : ""
          }`.trim()}
        >
          <div className={`modal-content`.trim()}>
            {!noHeader && (
              <header className="modal-header">
                <h5 className="modal-title">
                  {icon && <FontAwesomeIcon icon={icon} className="me-3" />}
                  {title || ""}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                  aria-label="Close"
                />
              </header>
            )}
            <ModalBody {...{ omitBody, padding }}>
              {Content && (
                <Content {...{ ...contentProps, ...modalUtilities }} />
              )}
            </ModalBody>
            {showButtons && (
              <div className="modal-footer">
                <Button variant="secondary" label="Cancel" onClick={onCancel} />
                {onConfirm && (
                  <Button variant="danger" label="Delete" onClick={onConfirm} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </a.div>
  );
};

export default Modal;
