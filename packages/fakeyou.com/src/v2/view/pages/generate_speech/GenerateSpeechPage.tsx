import React, { useState, useEffect } from "react";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import PageHeaderWithImage from "components/layout/PageHeaderWithImage";
import { Panel } from "v2/view/_common/Panel";
import { motion } from "framer-motion";
import { container } from "data/animation";
import Select from "react-select";
import VoicesModal from "./VoicesModal";

export const SearchFieldClass = {
  control: (state: any) =>
    state.isFocused ? "select-search focused" : "select-search",
  option: (state: any) => (state.isFocused ? "select-option" : "select-option"),
  input: (state: any) => (state.isFocused ? "select-input" : "select-input"),
  placeholder: (state: any) =>
    state.isFocused ? "select-placeholder" : "select-placeholder",
  singleValue: (state: any) =>
    state.isFocused ? "select-value" : "select-value",
  menu: (state: any) =>
    state.isFocused ? "select-container" : "select-container",
  indicatorSeparator: (state: any) =>
    state.isFocused ? "select-separator" : "select-separator",
};

function GenerateSpeechPage() {
  usePrefixedDocumentTitle("Generate Speech");

  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (showModal) {
      document.body.classList.toggle("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  const select = (
    <div onClick={handleShowModal}>
      <Select closeMenuOnSelect={true} openMenuOnClick={false}></Select>
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <PageHeaderWithImage
        headerImage="/mascot/kitsune_pose2.webp"
        title={<>Generate Speech</>}
        subText={<>Generate text to speech with your favorites characters</>}
      />

      <Panel padding>
        <div>
          <div>
            <label className="sub-title">Select a Voice</label>
            <div>{select}</div>
          </div>
        </div>
      </Panel>

      {showModal && <VoicesModal onClose={handleCloseModal} />}
    </motion.div>
  );
}

export { GenerateSpeechPage };
