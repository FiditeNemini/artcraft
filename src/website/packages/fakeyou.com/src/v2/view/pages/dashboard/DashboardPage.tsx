import React from "react";
import Dashboard from "../landing/Dashboard";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { Container } from "components/common";

interface DashboardPageProps {
  sessionWrapper: SessionWrapper;
}

export default function DashboardPage({ sessionWrapper }: DashboardPageProps) {
  usePrefixedDocumentTitle("AI Tools");

  return (
    <Container type="panel">
      <Dashboard sessionWrapper={sessionWrapper} />
    </Container>
  );
}
