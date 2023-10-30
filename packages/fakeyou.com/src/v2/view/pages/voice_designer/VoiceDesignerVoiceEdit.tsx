import React from "react";
import { faPlus, faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import { Route, NavLink, Switch, Redirect } from "react-router-dom";
import ListItems from "./components/ListItems/ListItems";

function VoiceDesignerMainPage() {
  usePrefixedDocumentTitle("Voice Designer");

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
  const datasetList = [
    {
      name: "Donald Trump (45th US President)",
      modelToken: "dummyToken",
    },
  ];
  const emptyList = [] as any[];

  function MyVoices() {
    return <ListItems type="voices" data={voicesList} />;
  }

  function MyDatasets() {
    return <ListItems type="datasets" data={datasetList} />;
  }

  return (
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
  );
}

export { VoiceDesignerMainPage };
