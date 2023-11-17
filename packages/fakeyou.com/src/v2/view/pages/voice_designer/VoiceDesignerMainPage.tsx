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

import {
  FrontendInferenceJobType,
  // InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";

function VoiceDesignerMainPage({ inferenceJobsByCategory }: { inferenceJobsByCategory: any }) {
  const { pathname } = useLocation();
  const { t } = useLocalize("FaceAnimator");
  const { datasets, voices } = useVoiceRequests({ requestDatasets: true, requestVoices: true });
  const [isDeleteVoiceModalOpen, setIsDeleteVoiceModalOpen] = useState(false);
  const [isDeleteDatasetModalOpen, setIsDeleteDatasetModalOpen] =
    useState(false);
  const view = ["/voice-designer/datasets", "/voice-designer/voices"].indexOf(
    pathname
  );

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
      let voiceToken = voices.list[target.name.split(",")[0].split(":")[1]].voice_token;
      todo(voiceToken, type);
    };


  const datasetClick =
    (todo: any, type: string) =>
    ({ target }: { target: any }) => {
      let datasetToken = datasets.list[target.name.split(",")[0].split(":")[1]].dataset_token;
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
          onClick: datasetClick(datasets.delete, "dataset"),
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
          onClick: voiceClick(voices.delete, "voice"),
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

  const statusTxt = (status: number, config: any) => [
    "Voice pending...",
    "Voice in progress",
    "Voice failed",
    "Voice dead",
    "Voice created successfully"
  ][status];

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
        <InferenceJobsList {...{
          t,
          inferenceJobs: inferenceJobsByCategory.get(FrontendInferenceJobType.VoiceDesignerCreateVoice), 
          statusTxt
        }}/>
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
