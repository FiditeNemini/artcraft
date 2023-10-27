import React from "react";
import { faPlus, faWaveform } from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import { Route, NavLink, Switch, Redirect } from "react-router-dom";
import ListItems from "./components/ListItems/ListItems";
import { Button } from "components/common";

function VoiceDesignerMainPage() {
  usePrefixedDocumentTitle("Voice Designer");

  const dummyData: any[] = [];

  const MyVoices: React.FC = () => {
    return <ListItems data={dummyData} />;
  };

  const Datasets: React.FC = () => {
    return (
      <div>
        <h4 className="fw-bold">Datasets</h4>
      </div>
    );
  };

  return (
    <Container type="panel">
      <PageHeader
        title="Voice Designer"
        titleIcon={faWaveform}
        subText="Turn text into your favorite character's voice."
        showButton={true}
        buttonLabel="Create New voice"
        buttonVariant="primary"
        buttonIcon={faPlus}
        buttonTo="/voice-designer/create"
      />

      <Panel>
        <nav>
          <ul className="nav nav-tabs">
            <div className="d-flex flex-grow-1">
              <li className="nav-item">
                <NavLink
                  to="/voice-designer/my-voices"
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
            <Route
              path="/voice-designer/my-voices"
              exact
              component={MyVoices}
            />
            <Route path="/voice-designer/datasets" exact component={Datasets} />
            <Redirect to="/voice-designer/my-voices" />
          </Switch>
        </div>
      </Panel>
    </Container>
  );
}

export { VoiceDesignerMainPage };
