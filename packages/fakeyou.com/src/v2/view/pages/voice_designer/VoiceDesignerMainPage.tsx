import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { faPlus, faWaveform } from "@fortawesome/pro-solid-svg-icons";
// import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import { NavLink } from "react-router-dom";
import ListItems from "./components/NewList";
import Modal from "components/common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/pro-solid-svg-icons";
import useVoiceRequests from "./useVoiceRequests";

function VoiceDesignerMainPage() {
  const { pathname } = useLocation();
  const { datasets, voices } = useVoiceRequests();
  const [isDeleteVoiceModalOpen, setIsDeleteVoiceModalOpen] = useState(false);
  const [isDeleteDatasetModalOpen, setIsDeleteDatasetModalOpen] = useState(false);
  const view = ["/voice-designer/datasets","/voice-designer/voices"].indexOf(pathname);

  // const openDeleteVoiceModal = () => {
  //   setIsDeleteVoiceModalOpen(true);
  // };

  const closeDeleteVoiceModal = () => {
    setIsDeleteVoiceModalOpen(false);
  };

  // const openDeleteDatasetModal = () => {
  //   setIsDeleteDatasetModalOpen(true);
  // };

  const closeDeleteDatasetModal = () => {
    setIsDeleteDatasetModalOpen(false);
  };

  const DataBadge = () => <span className="dataset-badge mb-0">Dataset</span>;
  const VoiceBadge = () => <FontAwesomeIcon icon={faMicrophone} className="me-2 me-lg-3" />;

  const history = useHistory();

  const navToEdit = (token: string, type: string) => { history.push(`/voice-designer/${ type }/${ token }/edit`) }

  const rowClick = (todo: any, type?: string) => ({ target }: { target: any }) => {
    let datasetToken = datasets.list[target.name.split(",")[0].split(":")[1]].dataset_token;
    todo(datasetToken, type);
  };

  const actionDataSets = datasets.list.map((dataset,i) => {
    return {
      ...dataset,
      badge: DataBadge,
      buttons: [{
        label: "Edit",
        small: true,
        variant: "secondary",
        onClick: rowClick(navToEdit,"dataset")
      },{
        label: "Delete",
        small: true,
        variant: "danger",
        onClick: rowClick(datasets.delete)
      }],
      name: dataset.title
    };
  });

  const actionVoices = voices.list.map((voice,i) => {
    return {
      ...voice,
      badge: VoiceBadge,
      buttons: [{
        label: "Edit",
        small: true,
        variant: "secondary",
        onClick: rowClick(navToEdit,"voice")
      },{
        label: "Delete",
        small: true,
        variant: "danger",
        onClick: rowClick(voices.delete)
      }],
      name: voice.title
    }
  });

  const button = {
    label: `Create new voice`,
    icon: faPlus,
    to: "/voice-designer/create" 
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

        <Panel>
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
            <ListItems {...{ data: view ? actionVoices : actionDataSets }}/>
          </div>
        </Panel>
      </Container>

      {/* Delete Voice Modal */}
      <Modal
        show={isDeleteVoiceModalOpen}
        handleClose={closeDeleteVoiceModal}
        title="Delete Voice"
        content={
          <p>
            Are you sure you want to delete "[Voice Name]"?
            <br />
            This cannot be undone.
          </p>
        }
      />
      {/* Delete Dataset Modal */}
      <Modal
        show={isDeleteDatasetModalOpen}
        handleClose={closeDeleteDatasetModal}
        title="Delete Dataset"
        content={
          <p>
            Are you sure you want to delete "[Dataset Name]"?
            <br />
            This cannot be undone.
          </p>
        }
      />
    </>
  );
}

export { VoiceDesignerMainPage };
