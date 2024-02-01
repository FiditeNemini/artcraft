import React, { useState, memo, useEffect } from "react";
import Searcher from "../Searcher";
import Modal from "../Modal";
import NonRouteTabs from "../Tabs/NonRouteTabs";
import Input from "../Input";
import Button from "../Button";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import SelectMediaList from "./SelectMediaList";
import SelectWeightsList from "./SelectWeightsList";

interface TabConfig {
  label: string;
  tabKey: string;
  type: "media" | "weights";
  weightTypeFilter?: string;
  mediaTypeFilter?: string;
  searcher?: boolean;
}
interface SelectModalProps {
  label?: string;
  tabs: TabConfig[];
  modalTitle?: string;
  onSelect?: (data:{
    token: string,
    title: string,
  }) => void;
  required?: boolean;
}

const SelectModal = memo(
  ({
    label,
    tabs,
    modalTitle = "Select",
    onSelect,
    required,
  }: SelectModalProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const initialValue = {token:"", title:""};
    const [selectedValue, setSelectedValue] = useState(initialValue);
    const [activeTab, setActiveTab] = useState(tabs[0].tabKey);
    const [mediaType, setMediaType] = useState(
      tabs[0].mediaTypeFilter || "all"
    );
    const [weightType, setWeightType] = useState(
      tabs[0].weightTypeFilter || "all"
    );

    // Update mediaType when activeTab changes
    useEffect(() => {
      const currentTab = tabs.find(tab => tab.tabKey === activeTab);
      setMediaType(currentTab?.mediaTypeFilter || "all");
      setWeightType(currentTab?.weightTypeFilter || "all");
    }, [activeTab, tabs]);

    const openModal = () => {
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

    const handleRemove = () => {
      setSelectedValue(initialValue);
    };

    const handleOnSelect = (data:{token:string, title:string}) => {
      console.log("selct modal handleOnSelect")
      console.log(data);
      console.log(data.title);
      setSelectedValue({token: data.token, title: data.title || ""});
      if (onSelect) onSelect(data);
      closeModal();
    }

    const searchTabs = tabs.map(tab => ({
      label: tab.label,
      content: tab.searcher ? (
        <Searcher
          type="modal"
          onResultSelect={closeModal}
          searcherKey={tab.tabKey}
          weightType={tab.weightTypeFilter}
        />
      ) : (
        <>
          {tab.type === "media" && (
            <SelectMediaList
              mediaType={mediaType}
              listKey={tab.tabKey}
              onResultSelect={handleOnSelect}
            />
          )}
          {tab.type === "weights" && (
            <SelectWeightsList
              weightType={weightType}
              listKey={tab.tabKey}
              onResultSelect={handleOnSelect}
            />
          )}
        </>
      ),
      padding: true,
      onClick: () => setActiveTab(tab.tabKey),
    }));

    return (
      <>
        <div>
          {label && (
            <label className={`sub-title ${required && "required"}`.trim()}>
              {label}
            </label>
          )}

          <div className="d-flex gap-2">
            <Input
              disabled={true}
              className="w-100"
              placeholder="None selected"
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
          content={() => <NonRouteTabs tabs={searchTabs} />}
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

export default SelectModal;
