import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useParams } from "react-router-dom";
import Input from "components/common/Input";
import Panel from "components/common/Panel";
import { faUser } from "@fortawesome/pro-solid-svg-icons";

interface VcModelEditPageProps {
  sessionWrapper: SessionWrapper;
}

export default function VcModelEditPage(props: VcModelEditPageProps) {
  let { token } = useParams() as { token: string };
  return (
    <div>
      <Panel padding>
        <Input
          label="Username"
          type="text"
          placeholder="Username"
          icon={faUser}
        />
      </Panel>
    </div>
  );
}
