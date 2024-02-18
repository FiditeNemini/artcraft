import React, {
  memo,
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  Button,
  TempInput as Input,
  Modal,
} from "components/common";

import { faTrash } from "@fortawesome/free-solid-svg-icons";

export type SelectModalData = {
  token: string;
  title: string;
}

interface SelectModalProps {
  label?: string;
  modalTitle?: string;
  value?: string;
  onClear: () => void;
  required?: boolean;
  children: ReactNode
}

export default memo(function SelectModal ({
  label,
  // tabs,
  modalTitle = "Select",
  onClear,
  value = "",
  required,
  children
}: SelectModalProps) {
    const [isModalOpen, setModalOpen] = useState(false
    )
    const openModal = () => {
      setModalOpen(true);
    };

    const closeModal = () => {
      setModalOpen(false);
    };

    useEffect(closeModal, [value]);

    return (
      <>
        <div>
          {label && (
            <label className={`sub-title ${required && "required"}`.trim()}>
              {label}
            </label>
          )}

          <div className="d-flex gap-2 position-relative">
            <div 
              className="position-absolute w-100 h-100"
              style={{"cursor": "pointer"}}
              onClick={openModal} 
            />
            <Input
              disabled={true}
              wrapperClassName="w-100"
              placeholder="None selected"
              onClick={openModal}
              value={value}
            />
            
            <Button label={value !== "" ? "Change" : "Select"} onClick={openModal} />
            {value && (
              <Button
                square={true}
                variant="danger"
                icon={faTrash}
                onClick={onClear}
                tooltip="Remove"
              />
            )}
          </div>
        </div>

        <Modal
          show={isModalOpen}
          handleClose={closeModal}
          title={modalTitle}
          content={()=>{return(<>{children}</>)}}
          showButtons={false}
          padding={false}
          large={true}
          position="top"
          mobileFullscreen={true}
        />
      </>
    );
  }
);
