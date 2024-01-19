import React, { useState } from "react";
import Searcher from "../Searcher";
import Modal from "../Modal";
import NonRouteTabs from "../Tabs/NonRouteTabs";
import Input from "../Input";
import Button from "../Button";
import useToken from "hooks/useToken";

interface SelectSearcherProps {
  label?: string;
  weightTypeFilter?: string;
}

export default function SelectSearcher({
  label,
  weightTypeFilter,
}: SelectSearcherProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { weightTitle } = useToken();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const searchTabs = [
    {
      label: "All LoRA Weights",
      content: (
        <Searcher
          type="modal"
          onResultSelect={closeModal}
          weightTypeFilter={weightTypeFilter}
        />
      ),
      padding: true,
    },
    {
      label: "Bookmarked",
      content: <Searcher type="modal" onResultSelect={closeModal} />,
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
          <Button label="Select" onClick={openModal} />
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
