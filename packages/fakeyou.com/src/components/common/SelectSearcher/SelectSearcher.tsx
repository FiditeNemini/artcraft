import React, { useState, memo } from "react";
import Searcher from "../Searcher";
import Modal from "../Modal";
import NonRouteTabs from "../Tabs/NonRouteTabs";
import Input from "../Input";
import Button from "../Button";
import useToken from "hooks/useToken";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface SelectSearcherProps {
  label?: string;
  weightTypeFilter?: string;
}

const SelectSearcher = memo(
  ({ label, weightTypeFilter }: SelectSearcherProps) => {
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

    const searchTabs = [
      {
        label: "All LoRA Weights",
        content: (
          <Searcher
            type="modal"
            onResultSelect={closeModal}
            weightTypeFilter={weightTypeFilter}
            searcherKey="allLoraWeights"
          />
        ),
        padding: true,
      },
      {
        label: "Bookmarked",
        content: (
          <>
            <Searcher
              type="modal"
              onResultSelect={closeModal}
              searcherKey="bookmarkedLoraWeights"
            />
            <h2 className="text-center py-4">
              NEEDS USER BOOKMARK ELASTIC SEARCH HERE
            </h2>
          </>
        ),
        padding: true,
      },
    ];
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
          title="Select a LoRA Weight"
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
