import React, { useEffect } from "react";
import Button from "../Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSpring, a } from "@react-spring/web";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "./Modal.scss";

interface ModalProps {
  show: boolean;
  handleClose: () => void;
  noHeader?: boolean;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => any;
  onConfirm?: (e: React.MouseEvent<HTMLElement>) => any;
  title?: string;
  content: React.ElementType;
  icon?: IconDefinition;
  autoWidth?: boolean;
  showButtons?: boolean;
  padding?: boolean;
  large?: boolean;
  position?: "center" | "top";
}

const Modal: React.FC<ModalProps> = ({
  autoWidth,
  content: Content,
  handleClose,
  noHeader,
  onCancel: cancelEvent,
  onConfirm: confirmEvent,
  icon,
  show,
  showButtons = true,
  title,
  padding = true,
  large = false,
  position = "center",
}) => {
  const fadeIn = useSpring({
    opacity: show ? 1 : 0,
    config: { duration: 80, easing: t => t },
    // onRest: () => {
    //   if (!show) handleClose();
    // },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent && !modalContent.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, handleClose]);

  const onCancel = (e: React.MouseEvent<HTMLElement>) => {
    if (cancelEvent) cancelEvent(e);
    handleClose();
  };

  const onConfirm = (e: React.MouseEvent<HTMLElement>) => {
    if (confirmEvent) confirmEvent(e);
    handleClose();
  };

  if (!show) {
    return null;
  }

  return (
    <a.div style={fadeIn} className="modal-backdrop">
      <div className="modal" role="dialog">
        <div
          className={`modal-dialog ${
            position === "center" ? "modal-dialog-centered" : ""
          } ${large ? "modal-xl" : ""} ${
            autoWidth ? "modal-width-auto" : ""
          }`.trim()}
        >
          <div className="modal-content">
            { !noHeader && <header className="modal-header">
                <h5 className="modal-title">
                  {icon && <FontAwesomeIcon icon={icon} className="me-3" />}
                  { title || "" }
                </h5>
                <button 
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                  aria-label="Close"
                />
              </header>
            }
            <div {...{ className: `modal-body ${padding ? "p-3" : ""}`}}>
              { Content && <Content {...{ handleClose }} /> }
            </div>
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
