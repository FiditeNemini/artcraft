import React, { useState, memo } from "react";
import Searcher from "../Searcher";
import Modal from "../Modal";
import NonRouteTabs from "../Tabs/NonRouteTabs";
import Input from "../Input";
import Button from "../Button";
import useToken from "hooks/useToken";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface TabConfig {
  label: string;
  searcherKey?: string;
  weightTypeFilter?: string;
  mediaTypeFilter?: string; // NOT DONE
}
interface SelectSearcherProps {
  label?: string;
  tabs: TabConfig[];
  modalTitle?: string;
}

const SelectSearcher = memo(
  ({ label, tabs, modalTitle = "Select" }: SelectSearcherProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { weightTitle, setWeightTitle } = useToken();

    const openModal = () => {
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

    const handleRemove = () => {
      setWeightTitle && setWeightTitle("");
    };

    const searchTabs = tabs.map(tab => ({
      label: tab.label,
      content: tab.searcherKey ? (
        <Searcher
          type="modal"
          onResultSelect={closeModal}
          searcherKey={tab.searcherKey}
          weightType={tab.weightTypeFilter}
        />
      ) : null,
      padding: true,
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
              value={weightTitle ? weightTitle : ""}
            />
            <Button
              label={weightTitle ? "Change" : "Select"}
              onClick={openModal}
            />
            {weightTitle && (
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

export default SelectSearcher;
