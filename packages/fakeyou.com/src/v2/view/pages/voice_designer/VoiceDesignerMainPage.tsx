import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { faPlus, faWaveform } from "@fortawesome/pro-solid-svg-icons";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { useLocalize } from "hooks";
// import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import { NavLink } from "react-router-dom";
import ListItems from "./components/NewList";
import Modal from "components/common/Modal";
import useVoiceRequests from "./useVoiceRequests";

function VoiceDesignerMainPage() {
  const { pathname } = useLocation();
  const { t } = useLocalize("FaceAnimator");
  const { datasets, voices } = useVoiceRequests({
    requestDatasets: true,
    requestVoices: true,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const view = ["/voice-designer/datasets", "/voice-designer/voices"].indexOf(
    pathname
  );
  const [deleteItem, setDeleteItem] = useState("");
  const [deleteType, setDeleteType] = useState("");
  const [deleteText, setDeleteText] = useState({
    title: "",
    text: "",
  });

  const openDeleteModal = (token: string, type: string) => {
    setDeleteItem(token);
    setDeleteType(type);
    setDeleteText({
      title: `Delete ${type}`,
      text: `Are you sure you want to delete this ${type}?`,
    });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteType === "voice") {
      voices.delete(deleteItem);
    } else if (deleteType === "dataset") datasets.delete(deleteItem);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  // const openDeleteDatasetModal = () => {
  //   setIsDeleteDatasetModalOpen(true);
  // };

  const history = useHistory();

  const navToEdit = (token: string, type: string) => {
    history.push(`/voice-designer/${type}/${token}/edit`);
  };

  const navToUseVoice = (token: string, type: string) => {
    history.push(`/voice-designer/voice/${token}`);
  };

  const voiceClick =
    (todo: any, type: string) =>
    ({ target }: { target: any }) => {
      let voiceToken =
        voices.list[target.name.split(",")[0].split(":")[1]].voice_token;
      todo(voiceToken, type);
    };

  const datasetClick =
    (todo: any, type: string) =>
    ({ target }: { target: any }) => {
      let datasetToken =
        datasets.list[target.name.split(",")[0].split(":")[1]].dataset_token;
      todo(datasetToken, type);
    };

  const actionDataSets = datasets.list.map((dataset, i) => {
    return {
      ...dataset,
      badge: "dataset",
      buttons: [
        {
          label: "Edit",
          small: true,
          variant: "secondary",
          onClick: datasetClick(navToEdit, "dataset"),
        },
        {
          label: "Delete",
          small: true,
          variant: "danger",
          onClick: datasetClick(openDeleteModal, "dataset"),
        },
      ],
      name: dataset.title,
    };
  });

  const actionVoices = voices.list.map((voice, i) => {
    return {
      ...voice,
      badge: "voice",
      buttons: [
        {
          label: "Edit",
          small: true,
          variant: "secondary",
          onClick: voiceClick(navToEdit, "voice"),
        },
        {
          label: "Delete",
          small: true,
          variant: "danger",
          onClick: voiceClick(openDeleteModal, "voice"),
        },
        {
          label: "Use Voice",
          small: true,
          variant: "primary",
          onClick: voiceClick(navToUseVoice, "voice"),
        },
      ],
      name: voice.title,
    };
  });

  const button = {
    label: `Create new voice`,
    icon: faPlus,
    to: "/voice-designer/create",
  };

  return (
    <>
      <Container type="panel">
        <PageHeader
          button={button}
          title="Voice Designer"
          titleIcon={faWaveform}
          subText="Create your own AI voice by providing audio files of the voice you want to clone."
          panel={false}
          imageUrl="/images/header/voice-designer.png"
        />
        <InferenceJobsList {...{ t }} />
        <Panel mb={true}>
          <nav>
            <ul className="nav nav-tabs">
              <div className="d-flex flex-grow-1">
                <li className="nav-item">
                  <NavLink
                    to="/voice-designer/voices"
                    className="nav-link fs-6 px-3 px-lg-4"
                    activeClassName="active"
                  >
                    My Voices
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/voice-designer/datasets"
                    className="nav-link fs-6"
                    activeClassName="active"
                  >
                    My Datasets
                  </NavLink>
                </li>
              </div>
            </ul>
          </nav>

          <div className="p-3 p-lg-4">
            <ListItems {...{ data: view ? actionVoices : actionDataSets }} />
          </div>
        </Panel>
      </Container>

      {/* Delete Modal */}
      <Modal
        show={isDeleteModalOpen}
        handleClose={closeDeleteModal}
        title={deleteText.title}
        content={<p>{deleteText.text}</p>}
        onConfirm={handleDelete}
      />
    </>
  );
}

export { VoiceDesignerMainPage };
