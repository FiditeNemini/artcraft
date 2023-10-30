import React from "react";
import {
  faEye,
  faLanguage,
  faWaveform,
} from "@fortawesome/pro-solid-svg-icons";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Container from "components/common/Container";
import Input from "components/common/Input";
import Select from "components/common/Select";
import { Button } from "components/common";

function VoiceDesignerVoiceEditPage() {
  usePrefixedDocumentTitle("Edit Voice");

  const dummyData = {
    name: "Name",
    visibility: "public",
    language: "English",
  };

  return (
    <Container type="panel">
      <PageHeader
        title="Edit Voice"
        titleIcon={faWaveform}
        subText="Make changes to your voice details"
        panel={false}
        showBackButton={true}
        backbuttonLabel="Back to Voice Designer"
        backbuttonTo="/voice-designer"
      />

      <Panel padding={true}>
        <div className="d-flex flex-column gap-4">
          <div className="row gy-4">
            <Input label="Name" placeholder="Voice name" />
          </div>

          <div>
            <Select
              value={dummyData.language}
              icon={faLanguage}
              label="Language"
            />
          </div>

          <div>
            <Select
              value={dummyData.visibility}
              icon={faEye}
              label="Visibility"
            />
          </div>

          <Button label="Save" />
        </div>
      </Panel>
    </Container>
  );
}

export { VoiceDesignerVoiceEditPage };
