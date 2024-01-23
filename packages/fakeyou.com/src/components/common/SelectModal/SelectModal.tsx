import React, { useState, memo, useEffect } from "react";
import Searcher from "../Searcher";
import Modal from "../Modal";
import NonRouteTabs from "../Tabs/NonRouteTabs";
import Input from "../Input";
import Button from "../Button";
import useToken from "hooks/useToken";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import SelectMediaList from "./SelectMediaList";
import SelectWeightsList from "./SelectWeightsList";

interface TabConfig {
  label: string;
  tabKey: string;
  type?: "media" | "weights";
  weightTypeFilter?: string;
  mediaTypeFilter?: string;
  searcher?: boolean;
}
interface SelectModalProps {
  label?: string;
  tabs: TabConfig[];
  modalTitle?: string;
}

const SelectModal = memo(
  ({ label, tabs, modalTitle = "Select" }: SelectModalProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { token, setToken, weightTitle, setWeightTitle } = useToken();
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
      setWeightType(currentTab?.mediaTypeFilter || "all");
    }, [activeTab, tabs]);

    const openModal = () => {
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

    const handleRemove = () => {
      setWeightTitle && setWeightTitle("");
      setToken("");
    };

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
              onResultSelect={closeModal}
            />
          )}
          {tab.type === "weights" && (
            <SelectWeightsList
              weightType={weightType}
              listKey={tab.tabKey}
              onResultSelect={closeModal}
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
          {label && <label className="sub-title">{label}</label>}

          <div className="d-flex gap-2">
            <Input
              disabled={true}
              className="w-100"
              placeholder="None selected"
              value={weightTitle ? weightTitle : token || ""}
            />
            <Button label={token ? "Change" : "Select"} onClick={openModal} />
            {token && (
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
