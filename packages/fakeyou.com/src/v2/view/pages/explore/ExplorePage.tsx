import { Panel } from "components/common";
import Container from "components/common/Container";
import Tabs from "components/common/Tabs";
import PageHeader from "components/layout/PageHeader";
import React from "react";

interface ExplorePageProps {}

export default function ExplorePage(props: ExplorePageProps) {
  const tabs = [
    {
      label: "Home",
      content: <div>Featured cards here</div>,
      to: "/explore/home",
      padding: true,
    },
    {
      label: "Weights",
      content: <div>Weights card list</div>,
      to: "/explore/weights",
      padding: true,
    },
    {
      label: "Media",
      content: <div>Media card list</div>,
      to: "/explore/media",
      padding: true,
    },
  ];

  return (
    <Container type="panel">
      <PageHeader title="Explore" subText="View community created content" />
      <Panel>
        <Tabs tabs={tabs} />
      </Panel>
    </Container>
  );
}
