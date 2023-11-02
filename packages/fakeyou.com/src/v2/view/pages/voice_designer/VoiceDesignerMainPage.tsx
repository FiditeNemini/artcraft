import React, { useEffect, useState } from "react";
import { faPlus, faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import { Route, NavLink, Switch, Redirect } from "react-router-dom";
import ListItems from "./components/ListItems/ListItems";
import Modal from "components/common/Modal";

import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { ListDatasetsByUser, Dataset } from "@storyteller/components/src/api/voice_designer/voice_datasets/ListDatasetsByUser";

interface Props {
  sessionWrapper: SessionWrapper;
}

function VoiceDesignerMainPage({ sessionWrapper }: Props) {
  const { user } = sessionWrapper.sessionStateResponse || {};
  const [datasets,datasetsSet] = useState<Dataset[]>([]);


  usePrefixedDocumentTitle("Voice Designer");

  useEffect(() => {

   if (!datasets.length && user) {
      ListDatasetsByUser("hanashi",{}).then(res => {
        if (res.datasets) datasetsSet(res.datasets);
      });
   }

  },[user,datasets]);

  const [isDeleteVoiceModalOpen, setIsDeleteVoiceModalOpen] = useState(false);
  const [isDeleteDatasetModalOpen, setIsDeleteDatasetModalOpen] =
    useState(false);

  const openDeleteVoiceModal = () => {
    setIsDeleteVoiceModalOpen(true);
  };

  const closeDeleteVoiceModal = () => {
    setIsDeleteVoiceModalOpen(false);
  };

  const openDeleteDatasetModal = () => {
    setIsDeleteDatasetModalOpen(true);
  };

  const closeDeleteDatasetModal = () => {
    setIsDeleteDatasetModalOpen(false);
  };

  const voicesList = [
    {
      name: "Donald Trump (45th US President)",
      modelToken: "TM:z7x37sbvb8vc",
      isCreating: true,
    },
    {
      name: "Spongebob Squarepants (Season 1)",
      modelToken: "TM:z7x37sbvb8vc",
    },
  ];
  // const datasetList = [
  //   {
  //     name: "Donald Trump (45th US President)",
  //     modelToken: "dummyToken",
  //   },
  // ];

  function MyVoices() {
    return (
      <ListItems
        type="voice"
        data={voicesList}
        handleDeleteVoice={openDeleteVoiceModal}
      />
    );
  }

  function MyDatasets() {
    return (
      <ListItems
        type="dataset"
        data={datasets}
        //data={datasetList}
        handleDeleteDataset={openDeleteDatasetModal}
      />
    );
  }

  return (
    <>
      <Container type="panel">
        <PageHeader
          title="Voice Designer"
          titleIcon={faWaveform}
          subText="Create your own AI voice by providing audio files of the voice you want to clone."
          showButton={true}
          buttonLabel="Create New voice"
          buttonVariant="primary"
          buttonIcon={faPlus}
          buttonTo="/voice-designer/create"
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
            <Switch>
              <Route path="/voice-designer/voices" exact component={MyVoices} />
              <Route
                path="/voice-designer/datasets"
                exact
                component={MyDatasets}
              />
              <Redirect to="/voice-designer/voices" />
            </Switch>
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
