import React, {
  memo,
  ReactNode,
  useState,
  // useEffect,
} from "react";

import {
  Button,
  TempInput as Input,
  Modal,
  // Searcher
} from "components/common";

// import NonRouteTabs from "../Tabs/NonRouteTabs";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export type SelectModalData = {
  token: string;
  title: string;
}

interface SelectModalProps {
  label?: string;
  modalTitle?: string;
  value?: SelectModalData;
  onSelect?: (data: SelectModalData) => void;
  required?: boolean;
  children: ReactNode
}

export default memo(function SelectModal ({
  label,
  // tabs,
  modalTitle = "Select",
  onSelect,
  value,
  required,
  children
}: SelectModalProps) {
    const emptyValue =  {token:"", title:""};
    const [{
      isModalOpen,
      selectedValue,
      // valueType,
      // activeTab
    },  setState] = useState({
      isModalOpen:false,
      selectedValue: value ? value : emptyValue,
      // activeTab: tabs[0].tabKey,
      // valueType: tabs[0].typeFilter || "all"
    })
    // console.log("🔫", tabs, activeTab, valueType);

    // Update mediaType when activeTab changes
    // useEffect(() => {
    //   const currentTab = tabs.find(tab => tab.tabKey === activeTab);
    //   setState((curr)=>({...curr, valueType: currentTab?.typeFilter || "all"}))
    // }, [activeTab, tabs]);

    const openModal = () => {
      setState((curr)=>({...curr, isModalOpen: true}));
    };

    const closeModal = () => {
      setState((curr)=>({...curr, isModalOpen: false}));
    };

    const handleRemove = () => {
      setState((curr)=>({...curr, selectedValue: emptyValue}));
      if (onSelect) onSelect(emptyValue);
    };

    const handleOnSelect = (data:{token:string, title:string}) => {
      setState((curr)=>({
        ...curr,
        selectedValue: {token: data.token, title: data.title || ""},
        isModalOpen: false
      }));
      if (onSelect) onSelect(data);
    }


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
              value={selectedValue.title !=="" 
                ? selectedValue.title 
                : selectedValue.token || ""}
            />
            
            <Button label={selectedValue.token !== "" ? "Change" : "Select"} onClick={openModal} />
            {selectedValue.token && (
              <Button
                square={true}
                variant="danger"
                icon={faTrash}
                onClick={handleRemove}
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
