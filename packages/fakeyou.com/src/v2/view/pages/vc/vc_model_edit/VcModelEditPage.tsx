import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useParams } from "react-router-dom";
import Input from "components/common/Input/Input";
import Panel from "components/common/Panel/Panel";
import { faUser } from "@fortawesome/pro-solid-svg-icons";

interface VcModelEditPageProps {
  sessionWrapper: SessionWrapper;
}

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value);
};

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
          onChange={handleChange}
        />
      </Panel>
    </div>
  );
}
