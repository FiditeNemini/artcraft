import React from "react";
import { InferenceJobsModal } from "components/modals";
import { Container, Panel } from "components/common";

export default function InferenceJobsPage() {
  return (
    <Container type="panel" className="mt-5">
      <Panel padding={true}>
        <InferenceJobsModal />
      </Panel>
    </Container>
  );
}
