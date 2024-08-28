import { Container, Panel } from "components/common";
import { AITools } from "components/marketing";
import React from "react";

interface ToolsTestPageProps {
  // Define props here
}

export const ToolsTestPage = (props: ToolsTestPageProps) => {
  return (
    <Container type="panel" className="mt-5">
      <Panel clear={true}>
        <h2 className="mb-4 fw-bold">AI Tools List Test Page</h2>
        <AITools />
      </Panel>
    </Container>
  );
};
