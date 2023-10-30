import React, { useRef, useEffect } from "react";
import Button from "../Button";
import { faTrashAlt } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSpring, a } from "@react-spring/web";

interface ModalProps {
  show: boolean;
  handleClose: () => void;
  title: string;
  content: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, handleClose, title, content }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const fadeIn = useSpring({
    opacity: show ? 1 : 0,
    config: { duration: 80, easing: (t) => t },
    onRest: () => {
      if (!show) handleClose();
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClose]);

  if (!show) {
    return null;
  }

  return (
    <a.div style={fadeIn} className="modal-backdrop">
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        style={{ display: "block" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <FontAwesomeIcon icon={faTrashAlt} className="me-3" />
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{content}</div>
            <div className="modal-footer">
              <Button
                variant="secondary"
                label="Cancel"
                onClick={handleClose}
              />
              <Button variant="danger" label="Delete" onClick={handleClose} />
            </div>
          </div>
        </div>
      </div>
    </a.div>
  );
};

export default Modal;
